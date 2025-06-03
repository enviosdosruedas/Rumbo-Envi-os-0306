// Analyze the CSV data to understand the pricing structure
async function analyzePricingData() {
  console.log("🔍 Analyzing pricing data from CSV files...\n")

  try {
    // Fetch services data
    console.log("📋 Fetching services data...")
    const servicesResponse = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hoja%20de%20c%C3%A1lculo%20sin%20t%C3%ADtulo%20-%20servicios-ybDPN1Il74RPhLxvCSeGScR2tN0LOe.csv",
    )
    const servicesText = await servicesResponse.text()

    // Fetch tariffs data
    console.log("💰 Fetching tariffs data...")
    const tariffsResponse = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hoja%20de%20c%C3%A1lculo%20sin%20t%C3%ADtulo%20-%20tarifas-oOreqQn76lk1k54rGp38FmQdBWItPQ.csv",
    )
    const tariffsText = await tariffsResponse.text()

    // Parse CSV data
    function parseCSV(text) {
      const lines = text.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ""
        })
        return obj
      })
      return { headers, data }
    }

    const services = parseCSV(servicesText)
    const tariffs = parseCSV(tariffsText)

    console.log("📊 SERVICES DATA:")
    console.log("Headers:", services.headers)
    console.log("Sample data:", services.data.slice(0, 3))
    console.log("Total services:", services.data.length)

    console.log("\n💵 TARIFFS DATA:")
    console.log("Headers:", tariffs.headers)
    console.log("Sample data:", tariffs.data.slice(0, 5))
    console.log("Total tariff ranges:", tariffs.data.length)

    // Analyze pricing structure
    console.log("\n🔍 PRICING ANALYSIS:")

    // Group tariffs by service type
    const tariffsByService = {}
    tariffs.data.forEach((tariff) => {
      const serviceId = tariff.tipo_servicio_id
      if (!tariffsByService[serviceId]) {
        tariffsByService[serviceId] = []
      }
      tariffsByService[serviceId].push({
        minKm: Number.parseFloat(tariff.distancia_min_km) || 0,
        maxKm: Number.parseFloat(tariff.distancia_max_km) || 0,
        price: Number.parseFloat(tariff.precio_rango) || 0,
      })
    })

    console.log("Tariffs grouped by service:")
    Object.keys(tariffsByService).forEach((serviceId) => {
      const service = services.data.find((s) => s.id === serviceId)
      console.log(`\nService ${serviceId} (${service?.nombre || "Unknown"}):`)
      tariffsByService[serviceId]
        .sort((a, b) => a.minKm - b.minKm)
        .forEach((tariff) => {
          console.log(`  ${tariff.minKm}-${tariff.maxKm} km: $${tariff.price}`)
        })
    })

    return { services: services.data, tariffs: tariffs.data, tariffsByService }
  } catch (error) {
    console.error("❌ Error analyzing data:", error)
    throw error
  }
}

// Run the analysis
analyzePricingData()
  .then((result) => {
    console.log("\n✅ Analysis completed successfully!")
  })
  .catch((error) => {
    console.error("❌ Analysis failed:", error)
  })
