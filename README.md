# 🛍️ Full-Stack E-commerce Backend

A feature-rich e-commerce backend that powers the platform where users can **browse, search, view, and purchase products**.  
This project demonstrates a complete **full-stack workflow** with secure user authentication, product management, and RESTful API design.

---

## 🚀 Demo Link

🔗 [Live Demo](https://e-commerce-frontend-alpha-flax.vercel.app/)

---

## ⚙️ Quick Start

```bash
# Clone the repository
git clone https://github.com/Jaytun-Kankotiya/eCommerce-Backend.git

# Navigate to the project directory
cd eCommerce-Backend

# Install dependencies
npm install

# Start the server
npm start   # or yarn start

```

**Technologies Used:**

- **Backend:** Express.js / Node.js
- **Database:** MongoDB
- **Authentication:** JWT-based secure authentication
- **Environment Management:** dotenv

---

## Features

**🏠 Home**

- Browse products categorized by type
- Search products by title or keyword

**🔐 Authentication**

- Secure user registration and login with JWT
- Protected routes for managing user-specific actions

**🛒 Products**

- Fetch all products or by category
- View detailed product information including ratings

---

## API Reference

### **POST /userProfile**</br>

Add a new user</br>
Sample Response:</br>

```
{ "userId": "abc123", "token": "your-jwt-token"}
```

### **GET /productListing**</br>

Retrieves all available products.</br>
Sample Response:</br>

```
[{_id, name, price, image, category, and description}, ...]
```

### **GET /productListing/:category**</br>

Retrieves all products from a specific category:</br>
Sample Response:</br>

```
[{_id, name, price, image, category, and description}, ...]
```

### **GET /product_details/:id**</br>

Retrieves detailed information about a specific product:</br>
Sample Response:</br>

```
{_id, name, price, image, category, and description, rating}
```

### **GET /cartItems**</br>

Retrieves all products currently added to the user's cart:
:</br>
Sample Response:</br>

```
[{_id, name, price, image}, ...]
```

### **GET /wishlist**</br>

Retrieves all products added to the user's wishlist:</br>
Sample Response:</br>

```
[{_id, name, price, image}, ...]
```

### **GET /address**</br>

Retrieves all saved user addresses:</br>
Sample Response:</br>

```
[{_id, name, email, phoneNumber, addressLine1, postalCode, city, province, country}, ...]
```

### **GET /orders**</br>

Retrieves all past orders for the authenticated user:</br>
Sample Response:</br>

```
[{_id, orderId, items, name, email, address, paymentMethod, totalOrderValue}, ...]
```

## Contact

For any questions, suggestions, or feature requests, feel free to reach out:</br>
📧 jaytunkankotiya81@gmail.com
