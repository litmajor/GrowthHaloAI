
import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(
  initialData: T,
  onUpdate: (data: T) => Promise<T>
) {
  const [data, setData] = useState(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const update = useCallback(async (newData: T) => {
    const previousData = data;
    
    // Optimistically update UI
    setData(newData);
    setIsOptimistic(true);

    try {
      // Perform actual update
      const result = await onUpdate(newData);
      setData(result);
      setIsOptimistic(false);
      return result;
    } catch (error) {
      // Rollback on error
      setData(previousData);
      setIsOptimistic(false);
      throw error;
    }
  }, [data, onUpdate]);

  return { data, update, isOptimistic };
}
