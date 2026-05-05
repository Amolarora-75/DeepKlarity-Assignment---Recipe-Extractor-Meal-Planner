import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 60000,
});

export const extractRecipe = (url) =>
  API.post('/extract', { url }).then((r) => r.data);

export const listRecipes = () =>
  API.get('/recipes').then((r) => r.data);

export const getRecipe = (id) =>
  API.get(`/recipes/${id}`).then((r) => r.data);

export const deleteRecipe = (id) =>
  API.delete(`/recipes/${id}`).then((r) => r.data);

export const generateMealPlan = (recipe_ids) =>
  API.post('/meal-plan', { recipe_ids }).then((r) => r.data);
