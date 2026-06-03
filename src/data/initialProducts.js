export const initialProducts = [
  // CATEGORY: AO (ÁO) - 5 sản phẩm
  {
    id: "jusst-ao-01",
    name: "Áo Thun Jusstlife Cotton Basic",
    price: 189000,
    originalPrice: 280000,
    category: "ao",
    categoryLabel: "Áo",
    gender: "Unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Xám", hex: "#8E8E93" }
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Áo thun Jusstlife Basic được dệt từ 100% sợi cotton tự nhiên siêu mềm mịn, co giãn 4 chiều cực thoải mái. Thiết kế phom suông rộng trẻ trung, đường may bo cổ kép tinh xảo chuẩn hàng hiệu, bền màu sau nhiều lần giặt. Thích hợp mặc hàng ngày, dễ phối với mọi loại quần.",
    rating: 4.9,
    reviewsCount: 142,
    soldCount: 450,
    inventory: 99,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-ao-02",
    name: "Áo Hoodie Nỉ Bông Jusstlife Signature",
    price: 349000,
    originalPrice: 550000,
    category: "ao",
    categoryLabel: "Áo",
    gender: "Unisex",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Xanh Rêu", hex: "#3B4E43" },
      { name: "Xám Tiêu", hex: "#D1D1D6" }
    ],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Áo khoác hoodie nỉ bông cao cấp Jusstlife đầm tay, lót bông hạt mịn giữ ấm cực tốt. Phom áo rộng oversized streetwear cá tính, mũ trùm sâu dày dặn 2 lớp cứng cáp, bo gấu dày không xù. Sản phẩm signature bán chạy hàng đầu của thương hiệu.",
    rating: 4.8,
    reviewsCount: 88,
    soldCount: 310,
    inventory: 45,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-ao-03",
    name: "Áo Polo Jusstlife Premium Knitwear",
    price: 269000,
    originalPrice: 390000,
    category: "ao",
    categoryLabel: "Áo",
    gender: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Xanh Navy", hex: "#1D2D44" },
      { name: "Trắng Kem", hex: "#F4F1EA" },
      { name: "Đen", hex: "#1A1A1A" }
    ],
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Áo thun Polo Jusstlife dệt kim cao cấp với mắt lưới dệt tổ ong thoáng khí, thấm hút mồ hôi vượt trội. Cổ áo đứng phom lịch lãm, tay bo nhẹ ôm bắp tay nam tính. Lựa chọn hoàn hảo cho những buổi họp mặt trang trọng hay đi chơi golf năng động.",
    rating: 4.7,
    reviewsCount: 65,
    soldCount: 195,
    inventory: 60,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  },
  {
    id: "jusst-ao-04",
    name: "Áo Sơ Mi Linen Cổ Tàu Jusstlife",
    price: 299000,
    originalPrice: 420000,
    category: "ao",
    categoryLabel: "Áo",
    gender: "Unisex",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Be nhạt", hex: "#E5D9C2" },
      { name: "Xanh Pastel", hex: "#B8D4E3" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Chất liệu đũi (Linen) tự nhiên nhẹ tênh, siêu mát mẻ cho những ngày hè rực nắng. Thiết kế cổ tàu vintage tinh tế, khuy gỗ mộc mạc mang phong cách tối giản của Nhật Bản. Thấm hút mồ hôi tốt và càng giặt càng mềm mịn.",
    rating: 4.6,
    reviewsCount: 42,
    soldCount: 120,
    inventory: 35,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: false
  },
  {
    id: "jusst-ao-05",
    name: "Áo Sweater Dệt Kim Jusstlife Vintage",
    price: 320000,
    originalPrice: 480000,
    category: "ao",
    categoryLabel: "Áo",
    gender: "Unisex",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Nâu Đất", hex: "#8A5A44" },
      { name: "Trắng Kem", hex: "#F4F1EA" }
    ],
    images: [
      "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Sợi len dệt cao cấp mềm mại, không dặm ngứa, co giãn đàn hồi tốt. Họa tiết dệt chìm sọc gân cổ điển, tôn phom dáng thanh lịch ấm áp mùa thu đông. Phong cách đậm chất Hàn Quốc nhẹ nhàng.",
    rating: 4.8,
    reviewsCount: 37,
    soldCount: 95,
    inventory: 28,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  },

  // CATEGORY: QUAN (QUẦN) - 4 sản phẩm
  {
    id: "jusst-quan-01",
    name: "Quần Jean Baggy Jusstlife Wash Retro",
    price: 389000,
    originalPrice: 590000,
    category: "quan",
    categoryLabel: "Quần",
    gender: "Unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Xanh Sáng", hex: "#A6C1EE" },
      { name: "Xanh Đậm", hex: "#2B4C7E" },
      { name: "Đen Wash", hex: "#3A3B3C" }
    ],
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Quần Jean phom Baggy rộng rãi che khuyết điểm chân cực tốt. Chất denim dày dặn 13.5oz bền bỉ, công nghệ mài wash màu retro tạo nét bụi bặm tự nhiên. Khóa kéo đồng YKK cao cấp chống kẹt tuyệt đối.",
    rating: 4.9,
    reviewsCount: 112,
    soldCount: 380,
    inventory: 50,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-quan-02",
    name: "Quần Jogger Kaki Cargo Pants Jusstlife",
    price: 319000,
    originalPrice: 450000,
    category: "quan",
    categoryLabel: "Quần",
    gender: "Unisex",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Xanh Rêu", hex: "#4A5240" },
      { name: "Màu Be", hex: "#D2C5B3" }
    ],
    images: [
      "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506629082925-534e36d4a1b0?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Quần jogger kaki túi hộp (Cargo Pants) đậm phong cách quân đội mạnh mẽ. Vải kaki cotton mềm dày dặn co giãn nhẹ, thiết kế nhiều túi tiện dụng để điện thoại ví tiền thoải mái, gấu quần bo thun năng động.",
    rating: 4.7,
    reviewsCount: 76,
    soldCount: 220,
    inventory: 40,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: false
  },
  {
    id: "jusst-quan-03",
    name: "Quần Short Tây Âu Cao Cấp Jusstlife",
    price: 199000,
    originalPrice: 290000,
    category: "quan",
    categoryLabel: "Quần",
    gender: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Xám Nhạt", hex: "#CCCCCC" },
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Xanh Than", hex: "#1D2D44" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df43c3?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Quần đùi tây âu phom lửng trên gối sang trọng. Chất vải tuyết mưa nhập khẩu mềm mại, chống nhăn cực tốt, giữ nếp ly quần hoàn hảo sau khi giặt. Thích hợp đi cafe dạo phố hoặc đi du lịch mùa hè.",
    rating: 4.6,
    reviewsCount: 54,
    soldCount: 165,
    inventory: 75,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  },
  {
    id: "jusst-quan-04",
    name: "Quần Nỉ Thun Jogger Jusstlife Comfort",
    price: 249000,
    originalPrice: 350000,
    category: "quan",
    categoryLabel: "Quần",
    gender: "Unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Xám Lông Chuột", hex: "#7E7E7E" },
      { name: "Đen", hex: "#1A1A1A" }
    ],
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620138546344-7b2c08f5812f?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Vải nỉ chân cua 100% cotton dày 380gsm siêu êm ái, co giãn và hút ẩm tốt. Lưng thun co giãn có dây rút điều chỉnh cá tính, phom đứng thời trang thích hợp mặc tập gym, chạy bộ hay mặc ở nhà.",
    rating: 4.8,
    reviewsCount: 93,
    soldCount: 290,
    inventory: 30,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: false
  },

  // CATEGORY: VAY (VÁY) - 4 sản phẩm
  {
    id: "jusst-vay-01",
    name: "Đầm Hoa Nhí Vintage Jusstlife",
    price: 399000,
    originalPrice: 620000,
    category: "vay",
    categoryLabel: "Váy",
    gender: "Women",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Hoa Vàng", hex: "#FFD166" },
      { name: "Hoa Xanh", hex: "#B8D4E3" }
    ],
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Đầm dáng xòe dài thướt tha, họa tiết hoa nhí mang đậm hơi thở đồng quê cổ điển Pháp. Cổ vuông quyến rũ khoe xương quai xanh, chi tiết bo chun tay bồng nhẹ nhàng. Chất tơ chiffon cao cấp có lớp lót trong mềm mại, bay bổng theo từng bước đi.",
    rating: 4.9,
    reviewsCount: 68,
    soldCount: 180,
    inventory: 22,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-vay-02",
    name: "Chân Váy Xếp Ly Tennis Jusstlife Preppy",
    price: 220000,
    originalPrice: 320000,
    category: "vay",
    categoryLabel: "Váy",
    gender: "Women",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Xám Ghi", hex: "#9E9E9E" }
    ],
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Chân váy tennis xếp ly đều đặn tăm tắp, cạp cao hack dáng cực đỉnh. Chất vải tuyết mưa dày dặn không bai nhão, có quần bảo hộ thun cotton co giãn bên trong giúp bạn tự tin vận động cả ngày dài.",
    rating: 4.7,
    reviewsCount: 82,
    soldCount: 260,
    inventory: 48,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: false
  },
  {
    id: "jusst-vay-03",
    name: "Đầm Suông Linen Mộc Mạc Jusstlife",
    price: 360000,
    originalPrice: 490000,
    category: "vay",
    categoryLabel: "Váy",
    gender: "Women",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Xanh Rêu Nhạt", hex: "#8DAA91" },
      { name: "Be Mộc", hex: "#EBE3D5" }
    ],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Đầm dáng suông rộng chữ A đơn giản mà thanh lịch. Thiết kế túi xéo hai bên tiện lợi, đường may thêu mộc mạc thủ công tỉ mỉ. Chất linen hữu cơ tự nhiên bay bổng, thoáng nhẹ, thấm hút cực mát.",
    rating: 4.8,
    reviewsCount: 29,
    soldCount: 88,
    inventory: 15,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  },
  {
    id: "jusst-vay-04",
    name: "Đầm Ôm Body Sexy Black Dress Jusstlife",
    price: 380000,
    originalPrice: 580000,
    category: "vay",
    categoryLabel: "Váy",
    gender: "Women",
    sizes: ["S", "M"],
    colors: [
      { name: "Đen Huyền Bí", hex: "#1A1A1A" },
      { name: "Đỏ Rượu", hex: "#722F37" }
    ],
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Chiếc váy Little Black Dress huyền thoại nâng tầm quyến rũ quyến phái. Thiết kế ôm trọn đường cong cơ thể với chất thun tăm gân co giãn ôm khít mà không gây khó chịu, phần lưng khoét sâu sành điệu.",
    rating: 4.9,
    reviewsCount: 45,
    soldCount: 140,
    inventory: 18,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  },

  // CATEGORY: PHUKIEN (PHỤ KIỆN) - 4 sản phẩm
  {
    id: "jusst-pk-01",
    name: "Mũ Lưỡi Trai Kaki Jusstlife Cap",
    price: 120000,
    originalPrice: 180000,
    category: "phukien",
    categoryLabel: "Phụ kiện",
    gender: "Unisex",
    sizes: ["One Size"],
    colors: [
      { name: "Đen", hex: "#1A1A1A" },
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Vàng Mustard", hex: "#E9B824" }
    ],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Mũ lưỡi trai thêu logo Jusstlife nổi sắc nét ở mặt trước. Chất kaki cotton dày dặn, thấm hút mồ hôi tốt. Khóa kim loại chống gỉ phía sau dễ dàng điều chỉnh kích cỡ vòng đầu phù hợp cho cả nam và nữ.",
    rating: 4.8,
    reviewsCount: 154,
    soldCount: 520,
    inventory: 150,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-pk-02",
    name: "Túi Canvas Jusstlife Eco Tote Bag",
    price: 99000,
    originalPrice: 150000,
    category: "phukien",
    categoryLabel: "Phụ kiện",
    gender: "Unisex",
    sizes: ["One Size"],
    colors: [
      { name: "Trắng Kem", hex: "#F4F1EA" },
      { name: "Đen", hex: "#1A1A1A" }
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Túi vải Canvas chất liệu bông tự nhiên dày dặn, thân thiện với môi trường. Đựng vừa laptop 15.6 inch, sách vở khổ A4 thích hợp đi học, đi chơi hay đi chợ xanh bảo vệ môi trường. Có túi dây kéo nhỏ bên trong.",
    rating: 4.9,
    reviewsCount: 198,
    soldCount: 680,
    inventory: 200,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: true,
    isNew: false
  },
  {
    id: "jusst-pk-03",
    name: "Thắt Lưng Da Bò Ý Jusstlife Classic",
    price: 250000,
    originalPrice: 380000,
    category: "phukien",
    categoryLabel: "Phụ kiện",
    gender: "Men",
    sizes: ["95cm", "105cm", "115cm"],
    colors: [
      { name: "Nâu Sẫm", hex: "#3D2B1F" },
      { name: "Đen Lịch Lãm", hex: "#1A1A1A" }
    ],
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Làm từ 100% da bò nguyên tấm nhập khẩu Ý mềm dai bền màu theo thời gian, không bong tróc nổ da. Đầu khóa hợp kim nguyên khối sơn tĩnh điện đen bóng chống xước, mang lại nét nam tính sang trọng.",
    rating: 4.7,
    reviewsCount: 51,
    soldCount: 110,
    inventory: 60,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: false
  },
  {
    id: "jusst-pk-04",
    name: "Set 3 Đôi Tất Cotton Cổ Cao Jusstlife Retro",
    price: 85000,
    originalPrice: 120000,
    category: "phukien",
    categoryLabel: "Phụ kiện",
    gender: "Unisex",
    sizes: ["Co giãn"],
    colors: [
      { name: "Set 3 Màu Phối", hex: "#EBE3D5" }
    ],
    images: [
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608228088998-57828365d486?w=600&auto=format&fit=crop&q=80"
    ],
    description: "Sợi dệt 95% cotton tự nhiên co giãn kết hợp 5% spandex ôm chân nhẹ nhàng, thấm hút mồ hôi siêu thoáng khí ngăn mùi hôi hiệu quả. Thiết kế sọc gân cổ điển cực dễ phối với sneaker.",
    rating: 4.8,
    reviewsCount: 132,
    soldCount: 420,
    inventory: 300,
    status: "approved",
    rejectReason: "",
    createdBy: "manager",
    isBestSeller: false,
    isNew: true
  }
];
