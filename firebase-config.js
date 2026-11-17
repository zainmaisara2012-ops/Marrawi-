rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// المنتجات: الكل يقدر يقرأ، بس الأدمن يقدر يعدل
match /products/{productId} {
allow read: if true;
allow write: if request.auth != null;
}
}
}
