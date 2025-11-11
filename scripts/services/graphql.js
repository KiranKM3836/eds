export const categoryQuery = `{
  categories(
    filters: {
      parent_id: {in: ["2"]}
    }
    pageSize: 100
    currentPage: 1
  ) {
    total_count
    items {
      uid
      id
      level
      name
      url_path
      path
      position
      children_count
      children {
        uid
        id
        level
        name
        path
        url_path
        position
        children_count
        children {
          uid
          id
          level
          name
          path
          url_path
          position
        }
      }
    }
    page_info {
      current_page
      page_size
      total_pages
    }
  }
}
`;