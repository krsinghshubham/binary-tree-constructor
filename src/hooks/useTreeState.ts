import { useState, useCallback, useMemo } from 'react';
import type { TreeNode, AppConfig } from '../types';
import {
  parseArray,
  serializeTree,
  removeNode,
  insertNode,
  updateNodeValue,
  findNode,
  genId,
  cloneTree,
  assignNewIds,
} from '../utils/treeParser';

export interface UseTreeStateOptions {
  inputText: string;
  setInputText: (s: string) => void;
}

export function useTreeState(config: AppConfig, options?: UseTreeStateOptions) {
  const [internalInput, setInternalInput] = useState<string>('[]');
  const inputText = options?.inputText ?? internalInput;
  const setInputText = options?.setInputText ?? setInternalInput;

  const root = useMemo(() => parseArray(inputText), [inputText]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const updateTreeFromInput = useCallback(
    (text: string) => {
      setInputText(text);
    },
    [setInputText],
  );

  const updateInputFromTree = useCallback(
    (newRoot: TreeNode | null) => {
      setInputText(serializeTree(newRoot));
    },
    [setInputText],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const newRoot = removeNode(root, nodeId);
      updateInputFromTree(newRoot);
      setSelectedNodeId(null);
    },
    [root, updateInputFromTree],
  );

  const editNodeValue = useCallback(
    (nodeId: string, newVal: number) => {
      const newRoot = updateNodeValue(root, nodeId, newVal);
      updateInputFromTree(newRoot);
    },
    [root, updateInputFromTree],
  );

  const addNode = useCallback(
    (parentId: string, side: 'left' | 'right', val: number, subtree?: TreeNode | null) => {
      let newNode: TreeNode;
      if (subtree) {
        newNode = assignNewIds(cloneTree(subtree))!;
      } else {
        newNode = { id: genId(), val, left: null, right: null };
      }
      const newRoot = insertNode(root, parentId, side, newNode);
      updateInputFromTree(newRoot);
    },
    [root, updateInputFromTree],
  );

  const moveNode = useCallback(
    (nodeId: string, newParentId: string, side: 'left' | 'right') => {
      if (!root) return;
      const nodeToMove = findNode(root, nodeId);
      if (!nodeToMove) return;

      const movedSubtree = cloneTree(nodeToMove);
      let newRoot = removeNode(root, nodeId);
      if (!newRoot) {
        updateInputFromTree(null);
        return;
      }
      if (movedSubtree) {
        const reassigned = assignNewIds(movedSubtree)!;
        newRoot = insertNode(newRoot, newParentId, side, reassigned);
      }
      updateInputFromTree(newRoot);
    },
    [root, updateInputFromTree],
  );

  const setRootNode = useCallback(
    (val: number) => {
      const newRoot: TreeNode = { id: genId(), val, left: null, right: null };
      updateInputFromTree(newRoot);
    },
    [updateInputFromTree],
  );

  const clearTree = useCallback(() => {
    updateInputFromTree(null);
    setSelectedNodeId(null);
  }, [updateInputFromTree]);

  return {
    root,
    inputText,
    selectedNodeId,
    setSelectedNodeId,
    updateTreeFromInput,
    updateInputFromTree,
    deleteNode,
    editNodeValue,
    addNode,
    moveNode,
    setRootNode,
    clearTree,
    config,
  };
}
