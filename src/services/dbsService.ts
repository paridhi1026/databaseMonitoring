import { fetchFromDBS } from './apiClient';
import {
  DataNode,
  EntityType,
  CERNServerInfo,
  DatasetItem,
  BlockItem,
  FileItem,
  DatasetSummary
} from '../types/dbs';

export class DBSService {
  /**
   * Check connection and fetch CERN DBS server status info.
   */
  public static async getServerInfo(overrideUrl?: string): Promise<CERNServerInfo> {
    try {
      const info = await fetchFromDBS<CERNServerInfo | CERNServerInfo[]>('serverinfo', {}, overrideUrl);
      if (Array.isArray(info)) {
        return info[0] || { status: 'ONLINE' };
      }
      return info;
    } catch (error) {
      // Try alternate status endpoint if serverinfo fails
      try {
        const status = await fetchFromDBS<{ status: string }>('status', {}, overrideUrl);
        return { status: status.status || 'ONLINE' };
      } catch {
        throw error;
      }
    }
  }

  /**
   * Search for datasets or files by pattern in CERN DBS
   */
  public static async searchEntities(query: string, overrideUrl?: string): Promise<DataNode[]> {
    if (!query.trim()) return [];

    const datasets = await fetchFromDBS<DatasetItem[]>('datasets', { dataset: query }, overrideUrl);

    return datasets.map((ds) => DBSService.mapDatasetToNode(ds));
  }

  /**
   * Get complete entity details by ID or dataset path
   */
  public static async getEntity(id: string, type?: EntityType, overrideUrl?: string): Promise<DataNode> {
    if (type === 'file' || id.endsWith('.root') || id.includes('#') === false && id.startsWith('/store/')) {
      const files = await fetchFromDBS<FileItem[]>('files', { logical_file_name: id }, overrideUrl);
      if (files && files.length > 0) {
        return DBSService.mapFileToNode(files[0]);
      }
    }

    if (type === 'block' || id.includes('#')) {
      const blocks = await fetchFromDBS<BlockItem[]>('blocks', { block_name: id }, overrideUrl);
      if (blocks && blocks.length > 0) {
        return DBSService.mapBlockToNode(blocks[0]);
      }
    }

    // Default to dataset lookup
    const datasets = await fetchFromDBS<DatasetItem[]>('datasets', { dataset: id }, overrideUrl);
    if (datasets && datasets.length > 0) {
      return DBSService.mapDatasetToNode(datasets[0]);
    }

    throw new Error(`CERN DBS Entity not found: ${id}`);
  }

  /**
   * Get the full parent ancestry chain for an entity
   */
  public static async getParentHierarchy(id: string, type?: EntityType, overrideUrl?: string): Promise<DataNode[]> {
    const parentChain: DataNode[] = [];

    if (type === 'file' || id.endsWith('.root')) {
      // 1. Fetch file parents
      try {
        const fileParents = await fetchFromDBS<{ parent_logical_file_name: string }[]>('fileparents', { logical_file_name: id }, overrideUrl);
        for (const fp of fileParents) {
          try {
            const pNode = await DBSService.getEntity(fp.parent_logical_file_name, 'file', overrideUrl);
            parentChain.push(pNode);
          } catch {
            // Ignore missing parent node details
          }
        }
      } catch {
        // fileparents call optional
      }
    }

    if (type === 'block' || id.includes('#')) {
      // Block parent dataset
      const blockNameParts = id.split('#');
      if (blockNameParts.length > 0) {
        const datasetPath = blockNameParts[0];
        try {
          const dsNode = await DBSService.getEntity(datasetPath, 'dataset', overrideUrl);
          parentChain.unshift(dsNode);
        } catch {
          // Ignore
        }
      }
    }

    // Fetch dataset parent chain
    const datasetPath = id.includes('#') ? id.split('#')[0] : id;
    try {
      const dsParents = await fetchFromDBS<{ parent_dataset: string }[]>('datasetparents', { dataset: datasetPath }, overrideUrl);
      for (const p of dsParents) {
        try {
          const parentDs = await DBSService.getEntity(p.parent_dataset, 'dataset', overrideUrl);
          parentChain.unshift(parentDs);
        } catch {
          // Ignore
        }
      }
    } catch {
      // Dataset parent call optional
    }

    // Standard CERN DBS tier hierarchy representation (Primary Dataset -> Acquisition Era -> Dataset)
    const entity = await DBSService.getEntity(id, type, overrideUrl).catch(() => null);
    if (entity && entity.type === 'dataset') {
      const meta = entity.metadata || {};
      if (meta.primary_ds_name) {
        const primaryNode: DataNode = {
          id: String(meta.primary_ds_name),
          name: String(meta.primary_ds_name),
          type: 'primary_dataset',
          status: 'VALID',
          metadata: {
            primary_ds_type: meta.primary_ds_type,
          }
        };
        parentChain.unshift(primaryNode);
      }
      if (meta.acquisition_era_name) {
        const eraNode: DataNode = {
          id: String(meta.acquisition_era_name),
          name: String(meta.acquisition_era_name),
          type: 'acquisition_era',
          status: 'VALID',
        };
        // Insert after primary dataset if present
        const insertIndex = parentChain.findIndex(n => n.type === 'primary_dataset') + 1;
        parentChain.splice(insertIndex, 0, eraNode);
      }
    }

    return parentChain;
  }

  /**
   * Get direct children of an entity
   */
  public static async getChildren(id: string, type?: EntityType, overrideUrl?: string): Promise<DataNode[]> {
    const children: DataNode[] = [];

    if (type === 'primary_dataset') {
      // Fetch datasets for this primary dataset
      const datasets = await fetchFromDBS<DatasetItem[]>('datasets', { primary_ds_name: id }, overrideUrl);
      return datasets.map((ds) => DBSService.mapDatasetToNode(ds));
    }

    if (type === 'dataset' || (!type && !id.includes('#') && !id.endsWith('.root'))) {
      // Fetch blocks for dataset
      try {
        const blocks = await fetchFromDBS<BlockItem[]>('blocks', { dataset: id }, overrideUrl);
        if (blocks && blocks.length > 0) {
          return blocks.map((b) => DBSService.mapBlockToNode(b));
        }
      } catch {
        // Fall back to dataset children
      }

      try {
        const dsChildren = await fetchFromDBS<{ child_dataset: string }[]>('datasetchildren', { dataset: id }, overrideUrl);
        for (const c of dsChildren) {
          try {
            const childNode = await DBSService.getEntity(c.child_dataset, 'dataset', overrideUrl);
            children.push(childNode);
          } catch {
            // Ignore
          }
        }
      } catch {
        // Ignore
      }
    }

    if (type === 'block' || id.includes('#')) {
      // Fetch files for block
      const files = await fetchFromDBS<FileItem[]>('files', { block_name: id }, overrideUrl);
      return files.map((f) => DBSService.mapFileToNode(f));
    }

    return children;
  }

  /**
   * Get detailed tabular preview & metadata payload for an entity
   */
  public static async getEntityData(id: string, type?: EntityType, overrideUrl?: string): Promise<{
    entity: DataNode;
    summary?: DatasetSummary | null;
    rawMetadata: Record<string, unknown>;
    previewData?: Record<string, unknown>[];
  }> {
    const entity = await DBSService.getEntity(id, type, overrideUrl);

    let summary: DatasetSummary | null = null;
    let previewData: Record<string, unknown>[] | undefined = undefined;

    if (entity.type === 'dataset') {
      try {
        const summaries = await fetchFromDBS<DatasetSummary[]>('filesummaries', { dataset: id }, overrideUrl);
        if (summaries && summaries.length > 0) {
          summary = summaries[0];
        }
      } catch {
        summary = null;
      }

      try {
        const blocks = await fetchFromDBS<BlockItem[]>('blocks', { dataset: id, detail: 1 }, overrideUrl);
        previewData = blocks as unknown as Record<string, unknown>[];
      } catch {
        // Ignore preview fetch failure
      }
    } else if (entity.type === 'block') {
      try {
        const files = await fetchFromDBS<FileItem[]>('files', { block_name: id, detail: 1 }, overrideUrl);
        previewData = files as unknown as Record<string, unknown>[];
      } catch {
        // Ignore
      }
    }

    return {
      entity,
      summary,
      rawMetadata: entity.metadata || {},
      previewData,
    };
  }

  // --- Normalization Helpers ---

  private static mapDatasetToNode(ds: DatasetItem): DataNode {
    const parts = ds.dataset.split('/').filter(Boolean);
    const primaryDs = ds.primary_ds_name || parts[0] || 'Primary';
    const processedDs = ds.processed_ds_name || parts[1] || '';
    const tier = ds.data_tier_name || parts[2] || '';

    return {
      id: ds.dataset,
      name: ds.dataset,
      type: 'dataset',
      path: ds.dataset,
      status: ds.dataset_access_type || 'VALID',
      createdBy: ds.create_by,
      creationDate: ds.creation_date,
      lastModified: ds.last_modification_date,
      metadata: {
        dataset_id: ds.dataset_id,
        primary_ds_name: primaryDs,
        primary_ds_type: ds.primary_ds_type,
        processed_ds_name: processedDs,
        data_tier_name: tier,
        acquisition_era_name: ds.acquisition_era_name,
        physics_group_name: ds.physics_group_name,
        prep_id: ds.prep_id,
        dataset_access_type: ds.dataset_access_type,
        last_modified_by: ds.last_modified_by,
      },
    };
  }

  private static mapBlockToNode(b: BlockItem): DataNode {
    return {
      id: b.block_name,
      name: b.block_name.includes('#') ? `#${b.block_name.split('#')[1]}` : b.block_name,
      type: 'block',
      path: b.block_name,
      status: 'VALID',
      sizeBytes: b.block_size,
      fileCount: b.file_count,
      createdBy: b.create_by,
      creationDate: b.creation_date,
      metadata: {
        block_id: b.block_id,
        dataset: b.dataset,
        origin_site_name: b.origin_site_name,
      },
    };
  }

  private static mapFileToNode(f: FileItem): DataNode {
    const filename = f.logical_file_name.split('/').pop() || f.logical_file_name;

    return {
      id: f.logical_file_name,
      name: filename,
      type: 'file',
      path: f.logical_file_name,
      status: f.is_file_valid === 1 ? 'VALID' : 'INVALID',
      sizeBytes: f.file_size,
      eventCount: f.event_count,
      creationDate: f.creation_date,
      metadata: {
        file_id: f.file_id,
        dataset: f.dataset,
        block_name: f.block_name,
        check_sum: f.check_sum,
        adler32: f.adler32,
        file_type: f.file_type,
      },
    };
  }
}
