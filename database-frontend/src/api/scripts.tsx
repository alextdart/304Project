const BASE_URL = '/api';

if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in the environment variables.");
}

// Utility function to handle fetch errors and parse responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

// Check database connection and return status as a string
export const checkDbConnection = async (): Promise<string> => {
    try {
        const response = await fetch(`${BASE_URL}/check-db-connection`, { method: 'GET' });
        return await response.text();
    } catch (error) {
        console.error('Error checking database connection:', error);
        return 'Connection failed';
    }
};

// Fetch data from the demotable and return it as an array of rows
export const fetchDemotable = async (): Promise<string[][]> => {
    try {
        const response = await fetch(`${BASE_URL}/demotable`, { method: 'GET' });
        const data = await handleResponse(response);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching demotable data:', error);
        return [];
    }
};

// Reset the demotable and return success status
export const resetDemotable = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/initiate-demotable`, { method: 'POST' });
        const data = await handleResponse(response);
        return data.success || false;
    } catch (error) {
        console.error('Error resetting demotable:', error);
        return false;
    }
};

// Insert data into the demotable and return success status
export const insertDemotable = async (id: number, name: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/insert-demotable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name }),
        });
        const data = await handleResponse(response);
        return data.success || false;
    } catch (error) {
        console.error('Error inserting into demotable:', error);
        return false;
    }
};

// Update a name in the demotable and return success status
export const updateNameDemotable = async (oldName: string, newName: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/update-name-demotable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName, newName }),
        });
        const data = await handleResponse(response);
        return data.success || false;
    } catch (error) {
        console.error('Error updating name in demotable:', error);
        return false;
    }
};

// Count the rows in the demotable and return the count
export const countDemotable = async (): Promise<number | null> => {
    try {
        const response = await fetch(`${BASE_URL}/count-demotable`, { method: 'GET' });
        const data = await handleResponse(response);
        return data.success ? data.count : null;
    } catch (error) {
        console.error('Error counting demotable:', error);
        return null;
    }
};
