package com.example.pcmarketx.util

import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import java.util.UUID

/**
 * API isteklerini mocklamak için kullanılan interceptor.
 * Test amacıyla kullanılır.
 */
class ApiMockInterceptor : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath
        val method = request.method
        
        val pathWithoutLeadingSlash = if (path.startsWith("/")) path.substring(1) else path
        
        // İstek türüne göre farklı mock yanıtlar döndür
        val responseString = when {
            // Auth endpoints
            (pathWithoutLeadingSlash.contains("api/auth/login") || path.contains("auth/login")) && method == "POST" -> loginResponse()
            (pathWithoutLeadingSlash.contains("api/auth/register") || path.contains("auth/register")) && method == "POST" -> registerResponse()
            (pathWithoutLeadingSlash.contains("api/auth/me") || path.contains("auth/me")) && method == "GET" -> meResponse()
            
            // Items endpoints
            (pathWithoutLeadingSlash == "api/items" || path == "items") && method == "GET" -> itemsListResponse()
            (pathWithoutLeadingSlash.matches(Regex("api/items/[^/]+")) || path.matches(Regex("items/[^/]+"))) && method == "GET" -> itemDetailResponse()
            (pathWithoutLeadingSlash == "api/items" || path == "items") && method == "POST" -> createItemResponse()
            (pathWithoutLeadingSlash.matches(Regex("api/items/[^/]+")) || path.matches(Regex("items/[^/]+"))) && method == "PUT" -> updateItemResponse()
            (pathWithoutLeadingSlash.matches(Regex("api/items/[^/]+")) || path.matches(Regex("items/[^/]+"))) && method == "DELETE" -> deleteItemResponse()
            
            // Orders endpoints
            (pathWithoutLeadingSlash == "api/orders" || path == "orders") && method == "GET" -> ordersListResponse()
            (pathWithoutLeadingSlash.matches(Regex("api/orders/[^/]+")) || path.matches(Regex("orders/[^/]+"))) && method == "GET" -> orderDetailResponse()
            (pathWithoutLeadingSlash == "api/orders" || path == "orders") && method == "POST" -> createOrderResponse()
            (pathWithoutLeadingSlash.matches(Regex("api/orders/[^/]+")) || path.matches(Regex("orders/[^/]+"))) && method == "PUT" -> updateOrderResponse()
            
            // Default fallback
            else -> {
                println("Endpoint not found: $path, method: $method")
                errorResponse("Endpoint not found: $path")
            }
        }
        
        return Response.Builder()
            .code(200)
            .message("OK")
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .body(responseString.toResponseBody("application/json".toMediaTypeOrNull()))
            .addHeader("content-type", "application/json")
            .build()
    }
    
    // Auth mock responses
    private fun loginResponse(): String = """
        {
          "success": true,
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "_id": "60d5f8b8b8b8b8b8b8b8b8b8",
            "username": "alperenkayis",
            "email": "alperen@example.com",
            "createdAt": "2023-05-15T14:23:45.123Z"
          }
        }
    """.trimIndent()
    
    private fun registerResponse(): String = """
        {
          "success": true,
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "_id": "60d5f8b8b8b8b8b8b8b8b8b8",
            "username": "alperenkayis",
            "email": "alperen@example.com",
            "createdAt": "2023-08-22T10:15:30.123Z"
          }
        }
    """.trimIndent()
    
    private fun meResponse(): String = """
        {
          "success": true,
          "user": {
            "_id": "60d5f8b8b8b8b8b8b8b8b8b8",
            "username": "alperenkayis",
            "email": "alperen@example.com",
            "createdAt": "2023-05-15T14:23:45.123Z"
          }
        }
    """.trimIndent()
    
    // Items mock responses
    private fun itemsListResponse(): String = """
        {
          "success": true,
          "items": [
            {
              "_id": "61d5f8b8b8b8b8b8b8b8b8b8",
              "title": "Gaming PC - Ultra Performans",
              "description": "En son teknoloji, yüksek performanslı oyun bilgisayarı...",
              "imageUrl": "https://example.com/images/gaming_pc.jpg",
              "price": 15999.99,
              "category": "Gaming PC",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-06-10T08:30:45.123Z",
              "updatedAt": "2023-07-15T11:22:33.123Z"
            },
            {
              "_id": "62e5f8b8b8b8b8b8b8b8b8b8",
              "title": "Ofis PC - İş İstasyonu",
              "description": "Verimli çalışma için güçlü ve sessiz ofis bilgisayarı...",
              "imageUrl": "https://example.com/images/office_pc.jpg",
              "price": 8499.99,
              "category": "Bilgisayar",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-06-12T09:45:22.123Z",
              "updatedAt": "2023-06-12T09:45:22.123Z"
            },
            {
              "_id": "63f5f8b8b8b8b8b8b8b8b8b8",
              "title": "Programlama PC - Yazılım Geliştirme",
              "description": "Yazılım geliştiriciler için ideal bilgisayar...",
              "imageUrl": "https://example.com/images/dev_pc.jpg",
              "price": 12499.99,
              "category": "Bilgisayar",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-08-22T14:55:30.123Z",
              "updatedAt": "2023-08-22T14:55:30.123Z"
            },
            {
              "_id": "64g5f8b8b8b8b8b8b8b8b8b8",
              "title": "Gaming Laptop - Taşınabilir Performans",
              "description": "Yüksek performanslı oyun deneyimi için taşınabilir çözüm...",
              "imageUrl": "https://example.com/images/gaming_laptop.jpg",
              "price": 18999.99,
              "category": "Laptop",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-07-05T11:30:45.123Z",
              "updatedAt": "2023-07-05T11:30:45.123Z"
            },
            {
              "_id": "65h5f8b8b8b8b8b8b8b8b8b8",
              "title": "4K Gaming Monitör",
              "description": "Ultra geniş görüş açısı, yüksek yenileme hızı...",
              "imageUrl": "https://example.com/images/4k_monitor.jpg",
              "price": 5999.99,
              "category": "Ekran Kartı",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-06-18T15:20:40.123Z",
              "updatedAt": "2023-06-18T15:20:40.123Z"
            },
            {
              "_id": "66i5f8b8b8b8b8b8b8b8b8b8",
              "title": "RTX 4090 Ekran Kartı",
              "description": "En son nesil oyun deneyimi için güçlü grafik kartı...",
              "imageUrl": "https://example.com/images/rtx_4090.jpg",
              "price": 39999.99,
              "category": "Ekran Kartı",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-08-01T09:15:30.123Z",
              "updatedAt": "2023-08-01T09:15:30.123Z"
            },
            {
              "_id": "67j5f8b8b8b8b8b8b8b8b8b8",
              "title": "Intel Core i9-13900K İşlemci",
              "description": "Maksimum performans için en güçlü işlemci...",
              "imageUrl": "https://example.com/images/i9_13900k.jpg",
              "price": 14999.99,
              "category": "İşlemci",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "createdAt": "2023-07-22T13:40:25.123Z",
              "updatedAt": "2023-07-22T13:40:25.123Z"
            }
          ],
          "total": 25,
          "page": 1,
          "pages": 3
        }
    """.trimIndent()
    
    private fun itemDetailResponse(): String = """
        {
          "success": true,
          "item": {
            "_id": "61d5f8b8b8b8b8b8b8b8b8b8",
            "title": "Gaming PC - Ultra Performans",
            "description": "En son teknoloji, yüksek performanslı oyun bilgisayarı...",
            "imageUrl": "https://example.com/images/gaming_pc.jpg",
            "price": 15999.99,
            "category": "Gaming PC",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "createdAt": "2023-06-10T08:30:45.123Z",
            "updatedAt": "2023-07-15T11:22:33.123Z",
            "specs": {
              "cpu": "Intel Core i9-13900K",
              "gpu": "NVIDIA RTX 4090",
              "ram": "64GB DDR5",
              "storage": "2TB NVMe SSD"
            }
          }
        }
    """.trimIndent()
    
    private fun createItemResponse(): String = """
        {
          "success": true,
          "item": {
            "_id": "${UUID.randomUUID()}",
            "title": "Programlama PC - Yazılım Geliştirme",
            "description": "Yazılım geliştiriciler için ideal bilgisayar...",
            "imageUrl": "https://example.com/images/dev_pc.jpg",
            "price": 12499.99,
            "category": "Development PC",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "createdAt": "2023-08-22T14:55:30.123Z",
            "updatedAt": "2023-08-22T14:55:30.123Z"
          }
        }
    """.trimIndent()
    
    private fun updateItemResponse(): String = """
        {
          "success": true,
          "item": {
            "_id": "61d5f8b8b8b8b8b8b8b8b8b8",
            "title": "Gaming PC - Ultra Performans (Güncellenmiş)",
            "description": "En son teknoloji, yüksek performanslı oyun bilgisayarı...",
            "imageUrl": "https://example.com/images/gaming_pc_updated.jpg",
            "price": 16999.99,
            "category": "Gaming PC",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "createdAt": "2023-06-10T08:30:45.123Z",
            "updatedAt": "2023-08-22T15:30:45.123Z"
          }
        }
    """.trimIndent()
    
    private fun deleteItemResponse(): String = """
        {
          "success": true,
          "data": {
            "success": true
          }
        }
    """.trimIndent()
    
    // Orders mock responses
    private fun ordersListResponse(): String = """
        {
          "success": true,
          "orders": [
            {
              "_id": "71d5f8b8b8b8b8b8b8b8b8b8",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "items": [
                {
                  "itemId": "61d5f8b8b8b8b8b8b8b8b8b8",
                  "title": "Gaming PC - Ultra Performans",
                  "price": 15999.99,
                  "quantity": 1
                },
                {
                  "itemId": "62f5f8b8b8b8b8b8b8b8b8b8",
                  "title": "27\" 4K Oyuncu Monitörü",
                  "price": 3499.99,
                  "quantity": 2
                }
              ],
              "totalAmount": 22999.97,
              "status": "completed",
              "createdAt": "2023-07-15T16:30:45.123Z",
              "updatedAt": "2023-07-16T10:15:22.123Z"
            },
            {
              "_id": "72d5f8b8b8b8b8b8b8b8b8b8",
              "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
              "items": [
                {
                  "itemId": "63f5f8b8b8b8b8b8b8b8b8b8",
                  "title": "Programlama PC - Yazılım Geliştirme",
                  "price": 12499.99,
                  "quantity": 1
                }
              ],
              "totalAmount": 12499.99,
              "status": "pending",
              "createdAt": "2023-08-22T18:45:33.123Z",
              "updatedAt": "2023-08-22T18:45:33.123Z"
            }
          ]
        }
    """.trimIndent()
    
    private fun orderDetailResponse(): String = """
        {
          "success": true,
          "order": {
            "_id": "71d5f8b8b8b8b8b8b8b8b8b8",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "items": [
              {
                "itemId": "61d5f8b8b8b8b8b8b8b8b8b8",
                "title": "Gaming PC - Ultra Performans",
                "description": "En son teknoloji, yüksek performanslı oyun bilgisayarı...",
                "imageUrl": "https://example.com/images/gaming_pc.jpg",
                "price": 15999.99,
                "quantity": 1
              },
              {
                "itemId": "62f5f8b8b8b8b8b8b8b8b8b8",
                "title": "27\" 4K Oyuncu Monitörü",
                "description": "Ultra geniş görüş açısı, yüksek tazeleme hızı...",
                "imageUrl": "https://example.com/images/gaming_monitor.jpg",
                "price": 3499.99,
                "quantity": 2
              }
            ],
            "totalAmount": 22999.97,
            "status": "completed",
            "shippingAddress": {
              "fullName": "Alperen Kayış",
              "address": "Örnek Mahallesi, Örnek Sokak No:123",
              "city": "İstanbul",
              "postalCode": "34000",
              "country": "Türkiye",
              "phone": "+90 555 123 4567"
            },
            "paymentMethod": "credit_card",
            "paymentDetails": {
              "last4": "4242",
              "brand": "Visa"
            },
            "createdAt": "2023-07-15T16:30:45.123Z",
            "updatedAt": "2023-07-16T10:15:22.123Z"
          }
        }
    """.trimIndent()
    
    private fun createOrderResponse(): String = """
        {
          "success": true,
          "order": {
            "_id": "${UUID.randomUUID()}",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "items": [
              {
                "itemId": "62e5f8b8b8b8b8b8b8b8b8b8",
                "title": "Ofis PC - İş İstasyonu",
                "price": 8499.99,
                "quantity": 1
              }
            ],
            "totalAmount": 8499.99,
            "status": "pending",
            "createdAt": "2023-08-23T09:15:30.123Z",
            "updatedAt": "2023-08-23T09:15:30.123Z"
          }
        }
    """.trimIndent()
    
    private fun updateOrderResponse(): String = """
        {
          "success": true,
          "order": {
            "_id": "71d5f8b8b8b8b8b8b8b8b8b8",
            "userId": "60d5f8b8b8b8b8b8b8b8b8b8",
            "items": [
              {
                "itemId": "61d5f8b8b8b8b8b8b8b8b8b8",
                "title": "Gaming PC - Ultra Performans",
                "price": 15999.99,
                "quantity": 1
              },
              {
                "itemId": "62f5f8b8b8b8b8b8b8b8b8b8",
                "title": "27\" 4K Oyuncu Monitörü",
                "price": 3499.99,
                "quantity": 2
              }
            ],
            "totalAmount": 22999.97,
            "status": "completed",
            "createdAt": "2023-07-15T16:30:45.123Z",
            "updatedAt": "2023-08-23T10:30:45.123Z"
          }
        }
    """.trimIndent()
    
    // Error response
    private fun errorResponse(message: String): String = """
        {
          "success": false,
          "message": "$message",
          "statusCode": 404
        }
    """.trimIndent()
} 