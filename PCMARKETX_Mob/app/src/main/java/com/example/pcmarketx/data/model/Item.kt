package com.example.pcmarketx.data.model

import com.google.gson.annotations.SerializedName
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type
import java.util.Date

data class Item(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val model: String? = null,
    val price: Double,
    val oldPrice: Double? = null,
    val discount: Int? = null,
    val description: String,
    val brand: String,
    val imageUrl: String,
    val stock: Int,
    @SerializedName("category")
    private val _category: Any, // Bu alan hem String hem de Category nesnesi olabilir
    val status: String,
    val features: List<String>?,
    val sales: Int?,
    val isActive: Boolean? = null,
    val isNewProduct: Boolean? = null,
    val featured: Boolean? = null,
    val popular: Boolean? = null,
    val rating: Double? = null,
    val numReviews: Int? = null,
    val specifications: Map<String, String>? = null,
    val createdAt: Date,
    val updatedAt: Date
) {
    // Kategori bilgisi için güvenli erişim sağlayan özellikler
    val categoryId: String
        get() = when (_category) {
            is String -> _category
            is Category -> _category.id
            else -> ""
        }

    val categoryName: String
        get() = when (_category) {
            is String -> ""
            is Category -> _category.name
            else -> ""
        }

    val categorySlug: String
        get() = when (_category) {
            is String -> ""
            is Category -> _category.slug
            else -> ""
        }
}

data class Category(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val slug: String
)

// Custom deserializer for flexible category handling
class ItemDeserializer : JsonDeserializer<Item> {
    override fun deserialize(
        json: JsonElement, 
        typeOfT: Type,
        context: JsonDeserializationContext
    ): Item {
        val jsonObject = json.asJsonObject
        
        // Tüm alanlarda null kontrolü yapacağız
        val categoryElement = if (jsonObject.has("category")) jsonObject.get("category") else null
        
        // Kategori ya String ya da Object olabilir
        val category = when {
            categoryElement == null -> ""
            categoryElement.isJsonNull -> ""
            categoryElement.isJsonPrimitive -> categoryElement.asString
            else -> {
                try {
                    context.deserialize<Category>(categoryElement, Category::class.java)
                } catch (e: Exception) {
                    ""
                }
            }
        }
        
        // Her bir alan için güvenli değer alma
        val id = if (jsonObject.has("_id") && !jsonObject.get("_id").isJsonNull) 
            jsonObject.get("_id").asString else ""
            
        val name = if (jsonObject.has("name") && !jsonObject.get("name").isJsonNull) 
            jsonObject.get("name").asString else ""
            
        val model = if (jsonObject.has("model") && !jsonObject.get("model").isJsonNull) 
            jsonObject.get("model").asString else null
            
        val price = if (jsonObject.has("price") && !jsonObject.get("price").isJsonNull) 
            jsonObject.get("price").asDouble else 0.0
            
        val oldPrice = if (jsonObject.has("oldPrice") && !jsonObject.get("oldPrice").isJsonNull) 
            jsonObject.get("oldPrice").asDouble else null
            
        val discount = if (jsonObject.has("discount") && !jsonObject.get("discount").isJsonNull) 
            jsonObject.get("discount").asInt else null
            
        val description = if (jsonObject.has("description") && !jsonObject.get("description").isJsonNull) 
            jsonObject.get("description").asString else ""
            
        val brand = if (jsonObject.has("brand") && !jsonObject.get("brand").isJsonNull) 
            jsonObject.get("brand").asString else ""
            
        val imageUrl = if (jsonObject.has("imageUrl") && !jsonObject.get("imageUrl").isJsonNull) 
            jsonObject.get("imageUrl").asString else ""
            
        val stock = if (jsonObject.has("stock") && !jsonObject.get("stock").isJsonNull) 
            jsonObject.get("stock").asInt else 0
            
        val status = if (jsonObject.has("status") && !jsonObject.get("status").isJsonNull) 
            jsonObject.get("status").asString else ""
            
        val featuresElement = if (jsonObject.has("features")) jsonObject.get("features") else null
        val features = if (featuresElement != null && !featuresElement.isJsonNull) {
            try {
                context.deserialize<List<String>>(featuresElement, List::class.java) as? List<String>
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
        
        val sales = if (jsonObject.has("sales") && !jsonObject.get("sales").isJsonNull) {
            try {
                jsonObject.get("sales").asInt
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
        
        val isActive = if (jsonObject.has("isActive") && !jsonObject.get("isActive").isJsonNull) 
            jsonObject.get("isActive").asBoolean else null
            
        val isNewProduct = if (jsonObject.has("isNewProduct") && !jsonObject.get("isNewProduct").isJsonNull) 
            jsonObject.get("isNewProduct").asBoolean else null
            
        val featured = if (jsonObject.has("featured") && !jsonObject.get("featured").isJsonNull) 
            jsonObject.get("featured").asBoolean else null
            
        val popular = if (jsonObject.has("popular") && !jsonObject.get("popular").isJsonNull) 
            jsonObject.get("popular").asBoolean else null
            
        val rating = if (jsonObject.has("rating") && !jsonObject.get("rating").isJsonNull) 
            jsonObject.get("rating").asDouble else null
            
        val numReviews = if (jsonObject.has("numReviews") && !jsonObject.get("numReviews").isJsonNull) 
            jsonObject.get("numReviews").asInt else null
            
        val specificationsElement = if (jsonObject.has("specifications")) jsonObject.get("specifications") else null
        val specifications = if (specificationsElement != null && !specificationsElement.isJsonNull) {
            try {
                context.deserialize<Map<String, String>>(specificationsElement, Map::class.java) as? Map<String, String>
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
        
        val createdAtElement = if (jsonObject.has("createdAt")) jsonObject.get("createdAt") else null
        val createdAt = if (createdAtElement != null && !createdAtElement.isJsonNull) {
            try {
                context.deserialize<Date>(createdAtElement, Date::class.java)
            } catch (e: Exception) {
                Date()
            }
        } else {
            Date()
        }
        
        val updatedAtElement = if (jsonObject.has("updatedAt")) jsonObject.get("updatedAt") else null
        val updatedAt = if (updatedAtElement != null && !updatedAtElement.isJsonNull) {
            try {
                context.deserialize<Date>(updatedAtElement, Date::class.java)
            } catch (e: Exception) {
                Date()
            }
        } else {
            Date()
        }
        
        return Item(
            id = id,
            name = name,
            model = model,
            price = price,
            oldPrice = oldPrice,
            discount = discount,
            description = description,
            brand = brand,
            imageUrl = imageUrl,
            stock = stock,
            _category = category,
            status = status,
            features = features,
            sales = sales,
            isActive = isActive,
            isNewProduct = isNewProduct,
            featured = featured,
            popular = popular,
            rating = rating,
            numReviews = numReviews,
            specifications = specifications,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}

data class ProductsResponse(
    val products: List<Item>,
    @SerializedName("page") val currentPage: Int,
    @SerializedName("pages") val totalPages: Int,
    @SerializedName("total") val totalProducts: Int
)

data class CreateItemRequest(
    val name: String,
    val price: Double,
    val description: String,
    val brand: String,
    val imageUrl: String,
    val stock: Int,
    val category: String,
    val features: List<String>?
)

data class UpdateItemRequest(
    val name: String? = null,
    val price: Double? = null,
    val description: String? = null,
    val brand: String? = null,
    val imageUrl: String? = null,
    val stock: Int? = null,
    val category: String? = null,
    val features: List<String>? = null
) 