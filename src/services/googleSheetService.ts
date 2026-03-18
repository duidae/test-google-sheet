import Papa from 'papaparse';

export interface SheetData {
  [key: string]: string;
}

export const fetchSheetData = async (sheetId: string): Promise<SheetData[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as SheetData[]);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    throw error;
  }
};
