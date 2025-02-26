let contractsData = null;
let sitesData = null;

document.getElementById('contractsFile').addEventListener('change', handleFileSelect);
document.getElementById('sitesFile').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const jsonData = JSON.parse(e.target.result);
        if (event.target.id === 'contractsFile') {
            contractsData = jsonData;
        } else {
            sitesData = jsonData;
        }
    };

    reader.readAsText(file);
}

function generateTable() {
    if (!contractsData || !sitesData) {
        alert('Please upload both contracts.json and sites.json files.');
        return;
    }

    document.getElementById('loading').style.display = 'block';

    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    const contracts = contractsData.data.paginatedContracts.contracts;
    const sites = sitesData.data.sites;

    const seenSubPartners = new Set();

    contracts.forEach(contract => {
        const contractName = contract.name;
        const operators = contract.operators.filter(operator => operator.title !== 'Bender' && operator.title !== 'Bender B2B');

        operators.forEach(operator => {
            const operatorTitle = operator.title;
            const operatorCode = operator.code;

            operator.operatorsRuntime.forEach(subPartner => {
                const uniqueId = `${contractName}-${operatorTitle}-${subPartner.name}-Connection`;
                if (!seenSubPartners.has(uniqueId)) {
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = contractName;
                    row.insertCell(1).textContent = operatorTitle;
                    row.insertCell(2).textContent = subPartner.name;
                    row.insertCell(3).textContent = 'Connection';
                    seenSubPartners.add(uniqueId);
                }
            });

            sites.forEach(site => {
                if (site.operatorCode === operatorCode) {
                    const uniqueId = `${contractName}-${operatorTitle}-${site.subPartnerId}-Site`;
                    if (!seenSubPartners.has(uniqueId)) {
                        const row = tableBody.insertRow();
                        row.insertCell(0).textContent = contractName;
                        row.insertCell(1).textContent = operatorTitle;
                        row.insertCell(2).textContent = site.subPartnerId;
                        row.insertCell(3).textContent = 'Site';
                        seenSubPartners.add(uniqueId);
                    }
                }
            });
        });
    });

    document.getElementById('loading').style.display = 'none';
}

function exportToCSV() {
    const table = document.getElementById('dataTable');
    const rows = Array.from(table.rows);
    const csvData = rows.map(row => Array.from(row.cells).map(cell => cell.textContent).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}