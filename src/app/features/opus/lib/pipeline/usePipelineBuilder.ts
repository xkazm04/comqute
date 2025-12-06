/**
 * Pipeline Builder Hook
 *
 * Manages the state and actions for the visual pipeline builder.
 */

import { useState, useCallback, useMemo } from "react";
import type {
  Pipeline,
  PipelineBlock,
  PipelineConnection,
  PipelineBuilderState,
  ModelBlock,
  ConditionBlock,
  ModelCategory,
} from "./types";
import {
  createEmptyPipeline,
  createModelBlock,
  createConditionBlock,
  createConnection,
  isValidConnection,
  getExecutionOrder,
} from "./types";

// ============================================================================
// INITIAL STATE
// ============================================================================

function createInitialState(userId: string): PipelineBuilderState {
  return {
    pipeline: createEmptyPipeline(userId),
    drag: {
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    },
    connection: {
      isDrawing: false,
      mousePosition: { x: 0, y: 0 },
    },
    selection: {
      selectedBlockIds: [],
      selectedConnectionIds: [],
    },
    zoom: 1,
    pan: { x: 0, y: 0 },
    history: [],
    historyIndex: -1,
    isModified: false,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function usePipelineBuilder(userId: string) {
  const [state, setState] = useState<PipelineBuilderState>(() =>
    createInitialState(userId)
  );

  // ----------------------------------------------------------------------------
  // HISTORY MANAGEMENT
  // ----------------------------------------------------------------------------

  const pushHistory = useCallback((pipeline: Pipeline) => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(pipeline)));
      return {
        ...prev,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
        isModified: true,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        pipeline: JSON.parse(JSON.stringify(prev.history[newIndex])),
        historyIndex: newIndex,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        pipeline: JSON.parse(JSON.stringify(prev.history[newIndex])),
        historyIndex: newIndex,
      };
    });
  }, []);

  // ----------------------------------------------------------------------------
  // BLOCK MANAGEMENT
  // ----------------------------------------------------------------------------

  const addModelBlock = useCallback(
    (
      modelId: string,
      category: ModelCategory,
      label: string,
      position: { x: number; y: number }
    ) => {
      const block = createModelBlock(modelId, category, label, position);
      setState((prev) => {
        const newPipeline = {
          ...prev.pipeline,
          blocks: [...prev.pipeline.blocks, block],
          updatedAt: Date.now(),
        };
        pushHistory(prev.pipeline);
        return {
          ...prev,
          pipeline: newPipeline,
          selection: {
            ...prev.selection,
            selectedBlockIds: [block.id],
          },
        };
      });
      return block.id;
    },
    [pushHistory]
  );

  const addConditionBlock = useCallback(
    (position: { x: number; y: number }) => {
      const block = createConditionBlock(position);
      setState((prev) => {
        const newPipeline = {
          ...prev.pipeline,
          blocks: [...prev.pipeline.blocks, block],
          updatedAt: Date.now(),
        };
        pushHistory(prev.pipeline);
        return {
          ...prev,
          pipeline: newPipeline,
          selection: {
            ...prev.selection,
            selectedBlockIds: [block.id],
          },
        };
      });
      return block.id;
    },
    [pushHistory]
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      setState((prev) => {
        // Remove block and all connections to/from it
        const newBlocks = prev.pipeline.blocks.filter((b) => b.id !== blockId);
        const newConnections = prev.pipeline.connections.filter(
          (c) => c.sourceBlockId !== blockId && c.targetBlockId !== blockId
        );

        const newPipeline = {
          ...prev.pipeline,
          blocks: newBlocks,
          connections: newConnections,
          updatedAt: Date.now(),
        };

        pushHistory(prev.pipeline);
        return {
          ...prev,
          pipeline: newPipeline,
          selection: {
            selectedBlockIds: prev.selection.selectedBlockIds.filter(
              (id) => id !== blockId
            ),
            selectedConnectionIds: [],
          },
        };
      });
    },
    [pushHistory]
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<PipelineBlock>) => {
      setState((prev) => {
        const newBlocks = prev.pipeline.blocks.map((b) =>
          b.id === blockId ? { ...b, ...updates } : b
        );

        const newPipeline = {
          ...prev.pipeline,
          blocks: newBlocks,
          updatedAt: Date.now(),
        };

        return {
          ...prev,
          pipeline: newPipeline,
          isModified: true,
        };
      });
    },
    []
  );

  const moveBlock = useCallback((blockId: string, position: { x: number; y: number }) => {
    setState((prev) => {
      const newBlocks = prev.pipeline.blocks.map((b) =>
        b.id === blockId ? { ...b, position } : b
      );

      return {
        ...prev,
        pipeline: {
          ...prev.pipeline,
          blocks: newBlocks,
          updatedAt: Date.now(),
        },
        isModified: true,
      };
    });
  }, []);

  // ----------------------------------------------------------------------------
  // CONNECTION MANAGEMENT
  // ----------------------------------------------------------------------------

  const addConnection = useCallback(
    (
      sourceBlockId: string,
      sourceOutputId: string,
      targetBlockId: string,
      targetInputId: string
    ) => {
      setState((prev) => {
        // Validate connection
        const validation = isValidConnection(
          prev.pipeline,
          sourceBlockId,
          targetBlockId
        );
        if (!validation.valid) {
          console.warn("Invalid connection:", validation.reason);
          return prev;
        }

        // Check if target input is already connected
        const existingConnection = prev.pipeline.connections.find(
          (c) => c.targetInputId === targetInputId
        );
        if (existingConnection) {
          console.warn("Target input already connected");
          return prev;
        }

        const connection = createConnection(
          sourceBlockId,
          sourceOutputId,
          targetBlockId,
          targetInputId
        );

        // Update connection points
        const newBlocks = prev.pipeline.blocks.map((block) => {
          if (block.id === sourceBlockId) {
            return {
              ...block,
              outputs: block.outputs.map((o) =>
                o.id === sourceOutputId
                  ? { ...o, connected: true, connectionId: connection.id }
                  : o
              ),
            };
          }
          if (block.id === targetBlockId) {
            return {
              ...block,
              inputs: block.inputs.map((i) =>
                i.id === targetInputId
                  ? { ...i, connected: true, connectionId: connection.id }
                  : i
              ),
            };
          }
          return block;
        });

        const newPipeline = {
          ...prev.pipeline,
          blocks: newBlocks,
          connections: [...prev.pipeline.connections, connection],
          updatedAt: Date.now(),
        };

        pushHistory(prev.pipeline);
        return {
          ...prev,
          pipeline: newPipeline,
          connection: {
            isDrawing: false,
            mousePosition: { x: 0, y: 0 },
          },
        };
      });
    },
    [pushHistory]
  );

  const removeConnection = useCallback(
    (connectionId: string) => {
      setState((prev) => {
        const connection = prev.pipeline.connections.find(
          (c) => c.id === connectionId
        );
        if (!connection) return prev;

        // Update connection points
        const newBlocks = prev.pipeline.blocks.map((block) => {
          if (block.id === connection.sourceBlockId) {
            return {
              ...block,
              outputs: block.outputs.map((o) =>
                o.connectionId === connectionId
                  ? { ...o, connected: false, connectionId: undefined }
                  : o
              ),
            };
          }
          if (block.id === connection.targetBlockId) {
            return {
              ...block,
              inputs: block.inputs.map((i) =>
                i.connectionId === connectionId
                  ? { ...i, connected: false, connectionId: undefined }
                  : i
              ),
            };
          }
          return block;
        });

        const newConnections = prev.pipeline.connections.filter(
          (c) => c.id !== connectionId
        );

        const newPipeline = {
          ...prev.pipeline,
          blocks: newBlocks,
          connections: newConnections,
          updatedAt: Date.now(),
        };

        pushHistory(prev.pipeline);
        return {
          ...prev,
          pipeline: newPipeline,
          selection: {
            ...prev.selection,
            selectedConnectionIds: prev.selection.selectedConnectionIds.filter(
              (id) => id !== connectionId
            ),
          },
        };
      });
    },
    [pushHistory]
  );

  // ----------------------------------------------------------------------------
  // DRAG & DROP
  // ----------------------------------------------------------------------------

  const startDragging = useCallback(
    (blockId: string, offset: { x: number; y: number }) => {
      setState((prev) => ({
        ...prev,
        drag: {
          isDragging: true,
          draggedBlockId: blockId,
          dragOffset: offset,
        },
      }));
    },
    []
  );

  const stopDragging = useCallback(() => {
    setState((prev) => {
      if (prev.drag.isDragging && prev.drag.draggedBlockId) {
        pushHistory(prev.pipeline);
      }
      return {
        ...prev,
        drag: {
          isDragging: false,
          dragOffset: { x: 0, y: 0 },
        },
      };
    });
  }, [pushHistory]);

  // ----------------------------------------------------------------------------
  // CONNECTION DRAWING
  // ----------------------------------------------------------------------------

  const startDrawingConnection = useCallback(
    (sourceBlockId: string, sourceOutputId: string) => {
      setState((prev) => ({
        ...prev,
        connection: {
          isDrawing: true,
          sourceBlockId,
          sourceOutputId,
          mousePosition: { x: 0, y: 0 },
        },
      }));
    },
    []
  );

  const updateConnectionMouse = useCallback(
    (position: { x: number; y: number }) => {
      setState((prev) => ({
        ...prev,
        connection: {
          ...prev.connection,
          mousePosition: position,
        },
      }));
    },
    []
  );

  const cancelDrawingConnection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      connection: {
        isDrawing: false,
        mousePosition: { x: 0, y: 0 },
      },
    }));
  }, []);

  // ----------------------------------------------------------------------------
  // SELECTION
  // ----------------------------------------------------------------------------

  const selectBlock = useCallback(
    (blockId: string, addToSelection = false) => {
      setState((prev) => ({
        ...prev,
        selection: {
          ...prev.selection,
          selectedBlockIds: addToSelection
            ? [...prev.selection.selectedBlockIds, blockId]
            : [blockId],
          selectedConnectionIds: [],
        },
      }));
    },
    []
  );

  const selectConnection = useCallback((connectionId: string) => {
    setState((prev) => ({
      ...prev,
      selection: {
        selectedBlockIds: [],
        selectedConnectionIds: [connectionId],
      },
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selection: {
        selectedBlockIds: [],
        selectedConnectionIds: [],
      },
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    setState((prev) => {
      let newPipeline = { ...prev.pipeline };

      // Delete selected connections
      for (const connId of prev.selection.selectedConnectionIds) {
        const connection = newPipeline.connections.find((c) => c.id === connId);
        if (connection) {
          newPipeline = {
            ...newPipeline,
            blocks: newPipeline.blocks.map((block) => {
              if (block.id === connection.sourceBlockId) {
                return {
                  ...block,
                  outputs: block.outputs.map((o) =>
                    o.connectionId === connId
                      ? { ...o, connected: false, connectionId: undefined }
                      : o
                  ),
                };
              }
              if (block.id === connection.targetBlockId) {
                return {
                  ...block,
                  inputs: block.inputs.map((i) =>
                    i.connectionId === connId
                      ? { ...i, connected: false, connectionId: undefined }
                      : i
                  ),
                };
              }
              return block;
            }),
            connections: newPipeline.connections.filter((c) => c.id !== connId),
          };
        }
      }

      // Delete selected blocks (except input/output)
      for (const blockId of prev.selection.selectedBlockIds) {
        const block = newPipeline.blocks.find((b) => b.id === blockId);
        if (block && block.type !== "input" && block.type !== "output") {
          newPipeline = {
            ...newPipeline,
            blocks: newPipeline.blocks.filter((b) => b.id !== blockId),
            connections: newPipeline.connections.filter(
              (c) => c.sourceBlockId !== blockId && c.targetBlockId !== blockId
            ),
          };
        }
      }

      newPipeline.updatedAt = Date.now();
      pushHistory(prev.pipeline);

      return {
        ...prev,
        pipeline: newPipeline,
        selection: {
          selectedBlockIds: [],
          selectedConnectionIds: [],
        },
      };
    });
  }, [pushHistory]);

  // ----------------------------------------------------------------------------
  // ZOOM & PAN
  // ----------------------------------------------------------------------------

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(0.25, Math.min(2, zoom)),
    }));
  }, []);

  const setPan = useCallback((pan: { x: number; y: number }) => {
    setState((prev) => ({
      ...prev,
      pan,
    }));
  }, []);

  const resetView = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: 1,
      pan: { x: 0, y: 0 },
    }));
  }, []);

  // ----------------------------------------------------------------------------
  // PIPELINE MANAGEMENT
  // ----------------------------------------------------------------------------

  const updatePipelineInfo = useCallback(
    (updates: { name?: string; description?: string; tags?: string[] }) => {
      setState((prev) => ({
        ...prev,
        pipeline: {
          ...prev.pipeline,
          ...updates,
          updatedAt: Date.now(),
        },
        isModified: true,
      }));
    },
    []
  );

  const loadPipeline = useCallback((pipeline: Pipeline) => {
    setState((prev) => ({
      ...prev,
      pipeline,
      history: [JSON.parse(JSON.stringify(pipeline))],
      historyIndex: 0,
      isModified: false,
      selection: {
        selectedBlockIds: [],
        selectedConnectionIds: [],
      },
    }));
  }, []);

  const resetPipeline = useCallback(() => {
    setState(createInitialState(userId));
  }, [userId]);

  // ----------------------------------------------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------------------------------------------

  const executionOrder = useMemo(
    () => getExecutionOrder(state.pipeline),
    [state.pipeline]
  );

  const isValid = useMemo(() => {
    // Check if all blocks are connected
    const connectedInputs = new Set(
      state.pipeline.connections.map((c) => c.targetInputId)
    );
    const connectedOutputs = new Set(
      state.pipeline.connections.map((c) => c.sourceOutputId)
    );

    for (const block of state.pipeline.blocks) {
      // Skip input block (no inputs) and output block (no outputs)
      if (block.type === "input") continue;
      if (block.type === "output") {
        // Output must have at least one input connected
        if (!block.inputs.some((i) => connectedInputs.has(i.id))) {
          return false;
        }
        continue;
      }

      // Other blocks must have all inputs connected
      if (!block.inputs.every((i) => connectedInputs.has(i.id))) {
        return false;
      }
    }

    // Check if input is connected to something
    const inputBlock = state.pipeline.blocks.find((b) => b.type === "input");
    if (inputBlock && !inputBlock.outputs.some((o) => connectedOutputs.has(o.id))) {
      return false;
    }

    return true;
  }, [state.pipeline]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // ----------------------------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------------------------

  return {
    // State
    state,
    pipeline: state.pipeline,
    selection: state.selection,
    zoom: state.zoom,
    pan: state.pan,
    isModified: state.isModified,
    isValid,
    executionOrder,
    canUndo,
    canRedo,

    // Block actions
    addModelBlock,
    addConditionBlock,
    removeBlock,
    updateBlock,
    moveBlock,

    // Connection actions
    addConnection,
    removeConnection,

    // Drag & drop
    startDragging,
    stopDragging,
    isDragging: state.drag.isDragging,
    draggedBlockId: state.drag.draggedBlockId,

    // Connection drawing
    startDrawingConnection,
    updateConnectionMouse,
    cancelDrawingConnection,
    isDrawingConnection: state.connection.isDrawing,
    connectionSourceBlockId: state.connection.sourceBlockId,
    connectionSourceOutputId: state.connection.sourceOutputId,
    connectionMousePosition: state.connection.mousePosition,

    // Selection
    selectBlock,
    selectConnection,
    clearSelection,
    deleteSelected,

    // View controls
    setZoom,
    setPan,
    resetView,

    // Pipeline management
    updatePipelineInfo,
    loadPipeline,
    resetPipeline,

    // History
    undo,
    redo,
  };
}
