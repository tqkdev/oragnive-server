oragnive-server là backend của ứng dụng thương mại điện tử được xây dựng bằng Express.js và MongoDB. Nó cung cấp các API cho frontend để thực hiện các chức năng như xác thực người dùng, quản lý sản phẩm, và đặt hàng.
## Tính Năng
- Xác thực và phân quyền người dùng
- Quản lý sản phẩm
- Quản lý đơn hàng
- Cơ chế làm mới token

## Công Nghệ
- **Backend**: Node.js, Express.js, MongoDB, JWT

## Cài Đặt

1. Clone repository:

    ```sh
    git clone git@github.com:tqkdev/oragnive-server.git
    cd ecommerce-app/oragnive-server
    ```

2. Cài đặt các phụ thuộc:

    ```sh
    npm install
    ```

3. Tạo file `.env` ở thư mục gốc của backend và thêm nội dung sau:

    ```env
    MONGO_URL=<chuỗi_kết_nối_mongo_db>
    JWT_ACCESS_KEY=<jwt_access_key>
    JWT_REFRESH_KEY=<jwt_refresh_key>
    PORT=3001
    ```

4. Khởi động server backend:

    ```sh
    npm start
    ```

