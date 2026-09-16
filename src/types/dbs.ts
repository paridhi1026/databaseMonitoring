/**
 * CERN Database Bookkeeping Service (DBS) Type Definitions
 * Aligned with official CERN DBS3 / dbs2go API specifications.
 */

export type EntityType =
  | 'primary_dataset'
  | 'acquisition_era'
  | 'dataset'
  | 'block'
  | 'file'
  | 'run'
  | 'collection'
  | 'data_group';

export type AccessStatus = 'VALID' | 'PRODUCTION' | 'DELETED' | 'DEPRECATED' | 'INVALID' | 'UNKNOWN';

export interface DataNode {
  id: string;
  name: string;
  type: EntityType;
  path?: string;
  parentId?: string | null;
  childrenCount?: number;
  status?: AccessStatus;
  sizeBytes?: number;
  eventCount?: number;
  fileCount?: number;
  creationDate?: string | number;
  lastModified?: string | number;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  parentChain?: DataNode[];
}

export interface CERNServerInfo {
  instance?: string;
  dbs_version?: string;
  server_time?: string;
  dbs_url?: string;
  status?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isChecking: boolean;
  baseUrl: string;
  instance: string;
  serverInfo?: CERNServerInfo | null;
  error?: string | null;
  lastChecked?: string | null;
}

export interface DatasetSummary {
  num_file?: number;
  num_event?: number;
  num_block?: number;
  file_size?: number;
  num_lumi?: number;
}

export interface DatasetItem {
  dataset: string;
  dataset_id?: number;
  primary_ds_name?: string;
  primary_ds_type?: string;
  processed_ds_name?: string;
  data_tier_name?: string;
  acquisition_era_name?: string;
  physics_group_name?: string;
  prep_id?: string;
  dataset_access_type?: AccessStatus;
  creation_date?: number;
  create_by?: string;
  last_modification_date?: number;
  last_modified_by?: string;
}

export interface BlockItem {
  block_name: string;
  block_id?: number;
  dataset: string;
  file_count?: number;
  block_size?: number;
  origin_site_name?: string;
  creation_date?: number;
  create_by?: string;
}

export interface FileItem {
  logical_file_name: string;
  file_id?: number;
  dataset?: string;
  block_name?: string;
  file_size?: number;
  event_count?: number;
  check_sum?: string;
  adler32?: string;
  file_type?: string;
  is_file_valid?: number;
  creation_date?: number;
}

export interface HierarchyResponse {
  current: DataNode;
  ancestors: DataNode[];
  children: DataNode[];
}
