import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function ShopPage({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterSize,
  setFilterSize,
  filterColor,
  setFilterColor,
  filterPriceRange,
  setFilterPriceRange,
  handleClearAllFilters,
  setSelectedProduct,
  handleAddToCart,
  showAlert,
  wishlist,
  handleToggleWishlist
}) {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchQuery, filterCategory, filterSize, filterColor, filterPriceRange, sortBy]);

  // --- FILTER SHOP SEARCH FLOW ---
  const activeApprovedProducts = products;
  const availableSizes = Array.from(
    new Set(
      activeApprovedProducts.flatMap((prod) =>
        Array.isArray(prod.sizes) ? prod.sizes.map((size) => String(size).trim()).filter(Boolean) : []
      )
    )
  );
  const availableColors = Array.from(
    new Map(
      activeApprovedProducts.flatMap((prod) =>
        Array.isArray(prod.colors)
          ? prod.colors
              .filter((color) => color?.name)
              .map((color) => [String(color.name).trim().toLowerCase(), color])
          : []
      )
    ).values()
  );

  const filteredProducts = activeApprovedProducts.filter((prod) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchCat = prod.categoryLabel.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // 2. Category
    if (filterCategory && prod.category !== filterCategory) return false;

    // 3. Size
    if (
      filterSize &&
      !prod.sizes.some((size) => String(size).trim().toLowerCase() === filterSize.trim().toLowerCase())
    ) return false;

    // 4. Color
    if (
      filterColor &&
      !prod.colors.some((c) => String(c?.name || '').trim().toLowerCase() === filterColor.trim().toLowerCase())
    ) return false;

    // 5. Price range
    if (filterPriceRange) {
      if (filterPriceRange === '0-200') {
        if (prod.price > 200000) return false;
      } else if (filterPriceRange === '200-400') {
        if (prod.price < 200000 || prod.price > 400000) return false;
      } else if (filterPriceRange === '400+') {
        if (prod.price < 400000) return false;
      }
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return Number(b.id || 0) - Number(a.id || 0);
    }
    if (sortBy === 'oldest') {
      return Number(a.id || 0) - Number(b.id || 0);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '', 'vi');
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '', 'vi');
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPageNumber - 1) * itemsPerPage,
    currentPageNumber * itemsPerPage
  );



  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar animate-fade">
          <div className="sidebar-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} />
              <span>Bộ Lọc Sản Phẩm</span>
            </div>
          </div>

          {/* Filter Category */}
          <div className="filter-group">
            <h4>Danh Mục</h4>
            <div className="filter-options">
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="category"
                  checked={filterCategory === ""}
                  onChange={() => setFilterCategory("")}
                />
                <span>Tất cả đồ</span>
              </label>
              {categories.map((c) => (
                <label key={c.code} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="category"
                    checked={filterCategory === c.code}
                    onChange={() => setFilterCategory(c.code)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Size */}
          <div className="filter-group">
            <h4>Kích Thước (Size)</h4>
            <div className="size-filter-grid">
              {(availableSizes.length > 0 ? availableSizes : ["S", "M", "L", "XL"]).map((sz) => (
                <button
                  key={sz}
                  className={`size-box-btn ${filterSize === sz ? 'active' : ''}`}
                  onClick={() => setFilterSize(filterSize === sz ? '' : sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Color */}
          <div className="filter-group">
            <h4>Bảng Màu Sắc</h4>
            <div className="color-filter-flex">
              {(availableColors.length > 0 ? availableColors : [
                { name: 'Đen', hex: '#1A1A1A' },
                { name: 'Trắng', hex: '#FFFFFF' },
                { name: 'Xám', hex: '#8E8E93' },
                { name: 'Xanh Navy', hex: '#1D2D44' },
                { name: 'Hoa Vàng', hex: '#FFD166' },
                { name: 'Be Mộc', hex: '#EBE3D5' }
              ]).map((col) => (
                <button
                  key={col.name}
                  className={`color-dot-btn ${filterColor === col.name ? 'active' : ''}`}
                  style={{ backgroundColor: col.hex || '#000' }}
                  onClick={() => setFilterColor(filterColor === col.name ? '' : col.name)}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Filter Price */}
          <div className="filter-group">
            <h4>Lọc Theo Giá</h4>
            <div className="filter-options">
              {[
                { name: "Tất cả các giá", val: "" },
                { name: "Dưới 200.000 ₫", val: "0-200" },
                { name: "Từ 200k - 400k", val: "200-400" },
                { name: "Trên 400.000 ₫", val: "400+" }
              ].map((pr) => (
                <label key={pr.name} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="price-range"
                    checked={filterPriceRange === pr.val}
                    onChange={() => setFilterPriceRange(pr.val)}
                  />
                  <span>{pr.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear filters button */}
          <button
            className="btn-secondary-outline"
            onClick={handleClearAllFilters}
            style={{ width: '100%', fontSize: '13px', padding: '10px 0', border: '1px solid #ddd', color: 'var(--secondary)' }}
          >
            <RefreshCw size={14} />
            <span>Xóa Tất Cả Bộ Lọc</span>
          </button>
        </aside>

        {/* Shop Grid Area */}
        <div className="shop-content-panel">
          {/* Search query tag */}
          {(filterCategory || filterSize || filterColor || filterPriceRange || searchQuery) && (
            <div className="shop-active-filters animate-fade">
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--secondary-muted)', display: 'flex', alignItems: 'center' }}>Bộ lọc đang bật:</span>
              {filterCategory && (
                <span className="active-filter-badge">
                  Danh mục: {categories.find(c => c.code === filterCategory)?.name || filterCategory}
                  <button onClick={() => setFilterCategory('')}><X size={12} /></button>
                </span>
              )}
              {filterSize && (
                <span className="active-filter-badge">
                  Size: {filterSize}
                  <button onClick={() => setFilterSize('')}><X size={12} /></button>
                </span>
              )}
              {filterColor && (
                <span className="active-filter-badge">
                  Màu: {filterColor}
                  <button onClick={() => setFilterColor('')}><X size={12} /></button>
                </span>
              )}
              {filterPriceRange && (
                <span className="active-filter-badge">
                  Giá: {filterPriceRange === '0-200' ? 'Dưới 200k' : filterPriceRange === '200-400' ? '200k-400k' : 'Trên 400k'}
                  <button onClick={() => setFilterPriceRange('')}><X size={12} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="active-filter-badge">
                  Từ khóa: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="no-products-found animate-fade">
              <h3>Không tìm thấy sản phẩm nào!</h3>
              <p style={{ color: 'var(--secondary-muted)', marginBottom: '20px' }}>Bạn hãy thử đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác nhé.</p>
              <button className="btn-go-shop" onClick={handleClearAllFilters}>
                Xem Tất Cả Sản Phẩm
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary-muted)', fontWeight: 500 }}>
                  Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm thiết kế Jusstlife
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--secondary)' }}>Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'white',
                      fontWeight: 600,
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="name-asc">Tên: A-Z</option>
                    <option value="name-desc">Tên: Z-A</option>
                  </select>
                </div>
              </div>
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {paginatedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                    showAlert={showAlert}
                    isWishlisted={wishlist.some(p => p.id === prod.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPageNumber}
                totalPages={totalPages}
                onPageChange={setCurrentPageNumber}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
