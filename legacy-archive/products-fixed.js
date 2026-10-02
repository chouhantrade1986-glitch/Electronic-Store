/* FIXED - No syntax errors */
const fallbackProducts = [
  {id:'1',name:'AstraBook Pro',brand:'AstraTech',price:999,rating:4.6},
  {id:'2',name:'Nimbus Phone',brand:'Nimbus',price:749,rating:4.5},
  {id:'3',name:'Pulse Headphones',brand:'PulseWave',price:179,rating:4.4},
  {id:'4',name:'4K TV',brand:'Nimbus',price:699,rating:4.7},
  {id:'5',name:'Keyboard',brand:'OrbitX',price:109,rating:4.3},
  {id:'6',name:'Tablet',brand:'ZenPad',price:529,rating:4.2},
  {id:'7',name:'Gaming Laptop',brand:'Vector',price:1299,rating:4.8},
  {id:'8',name:'Speaker',brand:'Echo',price:89,rating:4.1},
  {id:'9',name:'Office Bundle',brand:'AstraTech',price:8690,rating:4.7,segment:'b2b'},
  {id:'10',name:'Phone Pack',brand:'Nimbus',price:15499,rating:4.5,segment:'b2b'},
  {id:'11',name:'Headset Case',brand:'PulseWave',price:5399,rating:4.4,segment:'b2b'},
  {id:'12',name:'Accessory Pack',brand:'OrbitX',price:4299,rating:4.3,segment:'b2b'},
  {id:'13',name:'Lenovo Laptop',brand:'Lenovo',price:36000,segment:'b2c'}
];

const inrFormatter = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'});

document.addEventListener('DOMContentLoaded',()=>{
  const grid = document.getElementById('productsGrid');
  const meta = document.getElementById('resultMeta');
  if(grid){
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(250px,1fr))';
    grid.style.gap = '1rem';
    grid.innerHTML = fallbackProducts.map(p=>`
      <article style="border:1px solid #ddd;padding:1rem">
        <h3>${p.name}</h3>
        <p>${p.brand}</p>
        <p>${inrFormatter.format(p.price)}</p>
        <button>Add to cart</button>
      </article>
    `).join('');
  }
  if(meta) meta.textContent = `Showing ${fallbackProducts.length} products`;
  console.log('Products rendered:',fallbackProducts.length);
});
