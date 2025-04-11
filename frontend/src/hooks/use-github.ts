import { useState, useEffect } from 'react';
import axios from 'axios';

const useTimeTravel = () => {
  const [data, setData] = useState(null);      // Stores commit history data
  const [iserror, setError] = useState(null);      // Stores error if any
  const [isloading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/time-travel');
        // Assuming response structure is:
        // { data: [ { author, date, message, patch, ai_comment }, ...] }
        setData(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // runs once on mount

  return { data, iserror, isloading };
};

export default useTimeTravel;
