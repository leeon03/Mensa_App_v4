// api/openMensa.ts
import axios from 'axios';

const BASE_URL = 'https://openmensa.org/api/v2';

// Typen für die API-Daten
export type Canteen = {
  id: number;
  name: string;
  city: string;
  address: string;
  closed: boolean;
};

export type Meal = {
  id: number;
  name: string;
  category: string;
  notes: string[];
  prices: {
    students: number;
    employees: number;
    pupils?: number;
    others?: number;
  };
};

export const getCanteens = async (): Promise<Canteen[]> => {
  const response = await axios.get<Canteen[]>(`${BASE_URL}/canteens`);
  return response.data;
};

export const getMealsForDay = async (
  canteenId: number,
  date: string
): Promise<Meal[]> => {
  const url = `${BASE_URL}/canteens/${canteenId}/days/${date}/meals`;
  const response = await axios.get<Meal[]>(url);
  return response.data;
};
