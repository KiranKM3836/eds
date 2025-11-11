import { fetchCategories } from '../../scripts/services/commerce-category.js';
import { rootLink } from '../../scripts/commerce.js';

/**
 * Builds a category link URL from category data 
 * @param {Object} category - Category object with url_path
 * @returns {string} Formatted category URL
 */
function buildCategoryUrl(category) {
  if (!category.url_path) {
    return '#';
  }
  // If url_path already starts with /, use it directly, otherwise prefix with /categories/
  const path = category.url_path.startsWith('/') 
    ? category.url_path 
    : `/${category.url_path}`;
  return rootLink(path);
}

/**
 * Recursively builds HTML for category children
 * @param {Array} children - Array of child categories
 * @returns {DocumentFragment} Document fragment containing the submenu HTML
 */
function buildChildrenHTML(children) {
  if (!children || children.length === 0) {
    return document.createDocumentFragment();
  }

  const fragment = document.createDocumentFragment();
  const ul = document.createElement('ul');

  // Sort children by position if available
  const sortedChildren = [...children].sort((a, b) => {
    const posA = a.position || 0;
    const posB = b.position || 0;
    return posA - posB;
  });

  sortedChildren.forEach((child) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = buildCategoryUrl(child);
    link.textContent = child.name || 'Unnamed Category';
    link.setAttribute('data-category-id', child.id || child.uid);

    li.appendChild(link);

    // Recursively add children if they exist
    if (child.children && child.children.length > 0) {
      const childFragment = buildChildrenHTML(child.children);
      if (childFragment.hasChildNodes()) {
        li.appendChild(childFragment);
      }
    }

    ul.appendChild(li);
  });

  fragment.appendChild(ul);
  return fragment;
}

/**
 * Builds the complete category menu HTML structure
 * @param {Object} categoryData - Category data from GraphQL response
 * @returns {HTMLElement|null} The category menu element or null if no categories
 */
export function buildCategoryMenuHTML(categoryData) {
  if (!categoryData?.categories?.items || categoryData.categories.items.length === 0) {
    return null;
  }

  const categories = categoryData.categories.items;

  // Sort categories by position if available
  const sortedCategories = [...categories].sort((a, b) => {
    const posA = a.position || 0;
    const posB = b.position || 0;
    return posA - posB;
  });

  // Create the main category menu container
  const categoryMenuContainer = document.createElement('div');
  categoryMenuContainer.className = 'category-menu-container';

  const defaultContentWrapper = document.createElement('div');
  defaultContentWrapper.className = 'default-content-wrapper';

  const ul = document.createElement('ul');

  sortedCategories.forEach((category) => {
    const li = document.createElement('li');
    
    // Add nav-drop class if category has children
    if (category.children && category.children.length > 0) {
      li.classList.add('nav-drop');
    }

    const link = document.createElement('a');
    link.href = buildCategoryUrl(category);
    link.textContent = category.name || 'Unnamed Category';
    link.setAttribute('data-category-id', category.id || category.uid);

    li.appendChild(link);

    // Add children if they exist
    if (category.children && category.children.length > 0) {
      const childrenFragment = buildChildrenHTML(category.children);
      if (childrenFragment.hasChildNodes()) {
        li.appendChild(childrenFragment);
      }
    }

    ul.appendChild(li);
  });

  defaultContentWrapper.appendChild(ul);
  categoryMenuContainer.appendChild(defaultContentWrapper);

  return categoryMenuContainer;
}

/**
 * Loads and renders the category menu
 * @returns {Promise<HTMLElement|null>} Promise that resolves to the category menu element or null
 */
export async function loadCategoryMenu() {
  try {
    const categoryData = await fetchCategories();
    return buildCategoryMenuHTML(categoryData);
  } catch (error) {
    console.error('Failed to load category menu:', error);
    return null;
  }
}


