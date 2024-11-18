'use client';

import { useEffect, useState } from 'react';
import {
  checkDbConnection,
  fetchDemotable,
  resetDemotable,
  insertDemotable,
  countDemotable,
} from '@/api/scripts';

export default function HomePage() {
  const [dbStatus, setDbStatus] = useState('');
  const [demotable, setDemotable] = useState<string[][]>([]);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const status = await checkDbConnection();
      setDbStatus(status);

      const data = await fetchDemotable();
      setDemotable(data);
    };

    initialize();
  }, []);

  const handleReset = async () => {
    if (await resetDemotable()) {
      alert('Demotable reset successfully!');
      const data = await fetchDemotable();
      setDemotable(data);
    } else {
      alert('Failed to reset demotable');
    }
  };

  const handleInsert = async (id: number, name: string) => {
    if (await insertDemotable(id, name)) {
      alert('Data inserted successfully!');
      const data = await fetchDemotable();
      setDemotable(data);
    } else {
      alert('Failed to insert data');
    }
  };

  // const handleUpdate = async (oldName: string, newName: string) => {
  //   if (await updateNameDemotable(oldName, newName)) {
  //     alert('Name updated successfully!');
  //     const data = await fetchDemotable();
  //     setDemotable(data);
  //   } else {
  //     alert('Failed to update name');
  //   }
  // };

  const handleCount = async () => {
    const result = await countDemotable();
    setCount(result);
  };

  return (
      <div>
        <h1>Database MF Connection Type Shi Status: {dbStatus}</h1>
        <h2>Demotable Data:</h2>
        <ul>
          {demotable.map((row, index) => (
              <li key={index}>
                ID: {row[0]}, Name: {row[1]}
              </li>
          ))}
        </ul>
        <button onClick={handleReset}>Reset Demotable</button>
        <button onClick={handleCount}>Count Rows</button>
        {count !== null && <p>Count: {count}</p>}
      </div>
  );
}
