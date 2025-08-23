async function loadCSV(){
  const res = await fetch('datos.csv', {cache:'no-store'});
  if(!res.ok){
    document.getElementById('summary').textContent = 'No se encontró datos.csv';
    return;
  }
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  const rows = lines.map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    let [titulo, precio, ubicacion, link] = r;

    // Sanitize data
    const toText = (str) => str ? str.replace(/["']/g, '') : 'N/A';
    titulo = toText(titulo);
    precio = toText(precio);
    ubicacion = toText(ubicacion);
    link = link || '#';

    tr.innerHTML = `
      <td title="${titulo}">${titulo.length > 50 ? titulo.substring(0, 50) + '…' : titulo}</td>
      <td>${precio}</td>
      <td>${ubicacion}</td>
      <td><a href="${link}" target="_blank" rel="noopener noreferrer">Abrir</a></td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('summary').textContent = `Se encontraron ${rows.length} resultados.`;
}
loadCSV();
