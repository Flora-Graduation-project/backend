const BASE_URL = "https://backend-5xnh.vercel.app"; 
let currentCartItems = []; 

function showResponse(data) {
    document.getElementById("responseBox").textContent = JSON.stringify(data, null, 2);
}

async function apiCall(endpoint, method, body = null, isFormData = false) {
    const token = localStorage.getItem("token"); 
    
    const headers = {};
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["token"] = `flora ${token}`;
    }

    try {
        const options = {
            method,
            headers,
            body: isFormData ? body : (body ? JSON.stringify(body) : null)
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        showResponse(data);
        return data;
    } catch (err) {
        showResponse({ error: "Not Connected", message: err.message });
    }
}

/* ================= AUTH ================= */

function signup() {
    apiCall("/auth/signUp", "POST", {
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value,
        confirmPassword: signupConfirmPassword.value
    });
}

function login() {
    apiCall("/auth/logIn", "POST", {
        email: loginEmail.value,
        password: loginPassword.value
    }).then(res => {
        if (res && res.token) {
            localStorage.setItem("token", res.token);
        }
    });
}

function verify() {
    apiCall("/auth/verify", "POST", { 
        email: signupEmail.value.trim(), 
        code: verifyCode.value.trim() 
    });
}

function resendCode() {
    apiCall("/auth/resend-code", "POST", { 
        email: signupEmail.value.trim() 
    });
}

function forgetPassword() {
    apiCall("/auth/forgetPassword", "POST", { 
        email: forgetEmail.value.trim() 
    });
}

function verifyResetCode() {
    const emailValue = document.getElementById("forgetEmail").value.trim();
    const codeValue = document.getElementById("resetCode").value.trim();

    apiCall("/auth/verify", "POST", { 
        email: emailValue, 
        code: codeValue 
    }).then(res => {
        if (res && res.token) {
            localStorage.setItem("token", res.token);
        }
    });
}

function resetPassword() {
    const tokenValue = document.getElementById("manualToken").value.trim();
    
    const p1 = document.getElementById("newPassword").value;
    const p2 = document.getElementById("confirmNewPassword").value;

    if (!tokenValue) {
        alert("Paste Token Here");
        return;
    }

    apiCall("/auth/resetPassword", "POST", {
        newPassword: p1,        
        confirmPassword: p2      
    }, false); 
}

/* ================= USERS ================= */

function getProfile() {
    apiCall("/users/myprofile", "GET");
}

function editProfile() {
    const formData = new FormData();
    
    const nameInput = document.getElementById("editName");
    const imageInput = document.getElementById("editImage");

    if (nameInput.value.trim() !== "") {
        formData.append("name", nameInput.value.trim());
    }
    
    if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]); 
    }
    apiCall("/users/edit", "PATCH", formData, true); 
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
        
        apiCall("/users/delete", "DELETE").then(res => {  
            if (res && res.success) {
                setTimeout(() => {
                    localStorage.removeItem("token");
                }, 3000);
            }
        });
    }
}

/* =================  MARKET ITEM ================= */

function addPlant() {
    const body = {
        name: document.getElementById("plantName").value,
        subtitle: document.getElementById("plantSubtitle").value,
        type: document.getElementById("plantType").value,
        price: Number(document.getElementById("plantPrice").value), 
        quantity: Number(document.getElementById("plantQuantity").value),
        description: document.getElementById("plantDesc").value,
        image: document.getElementById("plantImage").value 
    };
    apiCall("/market", "POST", body, false).then(res => {
        if (res && res.success) {
            console.log("Plant added successfully!");
            getAllPlants();
        }
    });
}

function getAllPlants() {
    apiCall("/market", "GET").then(res => {
        console.log("Plants:", res);
    });
}

function getPlantDetails() {
    const id = document.getElementById("targetPlantId").value;
    
    if (!id) return alert("Please provide the Plant ID");

    apiCall(`/market/${id}`, "GET").then(res => {
        if (res && res.success) {
            console.log("Plant Details:", res);
        }
    });
}

function updatePlant() {
    const id = document.getElementById("targetPlantId").value;
    
    if (!id) return alert("Please provide the Plant ID");
    const body = {
        name: document.getElementById("plantName").value,
        price: Number(document.getElementById("plantPrice").value),
    };

    apiCall(`/market/${id}`, "PATCH", body, false).then(res => {
        if (res && res.success) {
            console.log("Plant updated successfully!");
        }
    });
}

function deleteProduct() { 
    const id = document.getElementById("targetPlantId").value;
    
    if (!id) return alert("Please provide the Plant ID");

    if (confirm("Are you sure you want to delete this plant?")) {
        apiCall(`/market/${id}`, "DELETE").then(res => {
            if (res && res.success) {
                console.log("Plant deleted successfully!");
            }
        });
    }
}

/* ================= SHOPPING CART ================= */

function addToCart() {
    const body = {
        itemId: document.getElementById("cartProductId").value,
        quantity: Number(document.getElementById("cartQuantity").value)
    };
    if (!body.itemId) return alert("Please provide the Item ID");

    apiCall("/cart/add", "POST", body);
}

function getUserCart() {
    apiCall("/cart", "GET").then(res => {
        if (res && res.cart && res.cart.items) {
            currentCartItems = res.cart.items;
        }
    });
}

function updateCartItem() {
    const body = {
        itemId: document.getElementById("cartItemId").value, 
        quantity: Number(document.getElementById("updateCartQty").value)
    };
    if (!body.itemId) return alert("Please provide the Cart Item ID");

    apiCall("/cart/update", "PATCH", body);
}

function deleteFromCart() {
    const body = {
        itemId: document.getElementById("cartItemId").value
    };
    if (!body.itemId) return alert("Please provide the Cart Item ID");
    if (confirm("Remove this item from your cart?")) {
        apiCall("/cart/remove", "DELETE", body); 
    }
}

/* =================  WISHLIST OPERATIONS ================= */

async function addToWishlist() {
    const productIdInput = document.getElementById("wishlistProductId");
    const productId = productIdInput.value.trim();

    if (!productId) {
        alert("Please paste the Product ID first!");
        return;
    }
    const body = { itemId: productId }; 
    await apiCall("/wishlist/add", "POST", body);
}

async function getWishlist() {
    try {
        await apiCall("/wishlist", "GET");
    } catch (err) {
        console.error(err);
    }
}

async function removeFromWishlist() {
    const itemId = document.getElementById("wishlistItemId").value.trim();
    if (!itemId) return alert("Please paste the Wishlist Item ID!");
    
    await apiCall("/wishlist/remove", "DELETE", { itemId: itemId });
}

async function moveToCart() {
    const itemId = document.getElementById("wishlistItemId").value.trim();
    if (!itemId) return alert("Please paste the Wishlist Item ID!");
    await apiCall("/wishlist/move-to-cart", "POST", { itemId: itemId });
}

/* ================= CHECKOUT & ORDERS ================= */

async function confirmOrder() {
    const body = {
        address: {
            fullName: document.getElementById("orderName").value,
            phone: document.getElementById("orderPhone").value,
            country: document.getElementById("orderCountry").value,
            governorate: document.getElementById("orderGov").value,
            fullAddress: document.getElementById("orderAddress").value,
            zipCode: document.getElementById("orderZip").value
        },
        paymentMethod: document.getElementById("orderPayment").value
    };
    apiCall("/orders/confirm", "POST", body, false);
}

async function getAllOrders() {
    apiCall("/orders/my-orders", "GET");
}

async function getAllRequests() {
    apiCall("/orders/my-requests", "GET");
}

async function getOrderDetails() {
    const id = document.getElementById("orderDetailId").value.trim();
    if (!id) return alert("Please paste the Order ID first!");
    apiCall(`/orders/${id}`, "GET");
}

async function getRequestDetails() {
    const id = document.getElementById("orderDetailId").value.trim();
    if (!id) return alert("Please paste the Request ID first!");
    apiCall(`/orders/request/${id}`, "GET");
}

/* ================= ENCYCLOPEDIA ================= */

async function getAllEncyclopediaPlants() {
    apiCall("/plants", "GET");
}

async function getPlantsWithPagination() {
    const page = document.getElementById("plantPage").value || 1;
    apiCall(`/plants?page=${page}`, "GET");
}

async function getPlantDetailsById() {
    const id = document.getElementById("targetPlantIdEnc").value;
    if (!id) return showResponse({ message: "Please paste a Plant ID first!" });
    
    apiCall(`/plants/${id}`, "GET");
}

async function getAllDiseases() {
    apiCall("/diseases", "GET");
}

async function getDiseasesWithPagination() {
    const page = document.getElementById("diseasePage").value || 1;
    apiCall(`/diseases?page=${page}`, "GET");
}

async function getDiseaseDetailsById() {
    const id = document.getElementById("targetDiseaseId").value;
    if (!id) return showResponse({ message: "Please paste a Disease ID first!" });
    
    apiCall(`/diseases/${id}`, "GET");
}
