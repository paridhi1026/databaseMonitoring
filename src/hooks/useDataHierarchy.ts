import { useState, useCallback, useEffect } from 'react';
import { DBSService } from '../services/dbsService';
import { DataNode, EntityType, DatasetSummary } from '../types/dbs';

interface HierarchyState {
  selectedEntity: DataNode | null;
  parentChain: DataNode[];
  children: DataNode[];
  summary: DatasetSummary | null;
  rawMetadata: Record<string, unknown>;
  previewData?: Record<string, unknown>[];
  isLoading: boolean;
  isLoadingHierarchy: boolean;
  error: string | null;
  hierarchyError: string | null;
}

export function useDataHierarchy(isConnected: boolean, baseUrl?: string) {
  const [state, setState] = useState<HierarchyState>({
    selectedEntity: null,
    parentChain: [],
    children: [],
    summary: null,
    rawMetadata: {},
    previewData: undefined,
    isLoading: false,
    isLoadingHierarchy: false,
    error: null,
    hierarchyError: null,
  });

  const selectNode = useCallback(async (id: string, type?: EntityType) => {
    if (!isConnected) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingHierarchy: false,
        error: 'No data source connected. Please connect a CERN DBS backend service.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isLoadingHierarchy: true,
      error: null,
      hierarchyError: null,
    }));

    try {
      // 1. Fetch main entity data
      const dataPayload = await DBSService.getEntityData(id, type, baseUrl);

      // 2. Fetch parent hierarchy (ancestry chain) concurrently
      let parentChain: DataNode[] = [];
      let hierarchyErr: string | null = null;
      try {
        parentChain = await DBSService.getParentHierarchy(id, type, baseUrl);
      } catch (hErr) {
        hierarchyErr = hErr instanceof Error ? hErr.message : 'Unable to load hierarchy';
      }

      // 3. Fetch direct children
      let children: DataNode[] = [];
      try {
        children = await DBSService.getChildren(id, type, baseUrl);
      } catch {
        // Non-fatal if node has no accessible children
      }

      setState({
        selectedEntity: dataPayload.entity,
        parentChain,
        children,
        summary: dataPayload.summary || null,
        rawMetadata: dataPayload.rawMetadata || {},
        previewData: dataPayload.previewData,
        isLoading: false,
        isLoadingHierarchy: false,
        error: null,
        hierarchyError: hierarchyErr,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entity data from CERN DBS service';
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingHierarchy: false,
        error: errorMessage,
      }));
    }
  }, [isConnected, baseUrl]);

  const clearSelection = useCallback(() => {
    setState({
      selectedEntity: null,
      parentChain: [],
      children: [],
      summary: null,
      rawMetadata: {},
      previewData: undefined,
      isLoading: false,
      isLoadingHierarchy: false,
      error: null,
      hierarchyError: null,
    });
  }, []);

  // When connection state toggles to false, clear selected entity
  useEffect(() => {
    if (!isConnected) {
      clearSelection();
    }
  }, [isConnected, clearSelection]);

  return {
    ...state,
    selectNode,
    clearSelection,
  };
}
