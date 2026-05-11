import fetch from 'node-fetch';

async function run() {
  console.log('Testing POST /api/products')
  const res = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test Add Product",
      base_price: 999
    })
  })
  const data = await res.json()
  console.log('POST status:', res.status)
  console.log('POST data:', data)

  if (data.id) {
    console.log('Testing DELETE /api/products/' + data.id)
    const delRes = await fetch('http://localhost:3000/api/products/' + data.id, {
      method: 'DELETE'
    })
    console.log('DELETE status:', delRes.status)
    const delData = await delRes.json()
    console.log('DELETE data:', delData)
  }
}

run()
