// ==========================================
// Rajagiri Gene Coverage Summary
// ==========================================

let geneData = [];

// ==========================================
// Load CSV
// ==========================================

fetch(`Gene_Coverage_Summary.csv?v=${Date.now()}`)
.then(response => {

    if(!response.ok){

        throw new Error("Unable to load CSV file.");

    }

    return response.text();

})
.then(csv => {

    parseCSV(csv);

    renderTable(geneData);

})
.catch(err => {

    console.error(err);

    alert("Unable to load Gene_Coverage_Summary.csv");

});


// ==========================================
// Parse CSV
// ==========================================

function parseCSV(csv){

    const lines = csv.trim().split(/\r?\n/);

    if(lines.length < 2)
        return;

    const header = lines[0].split(",").map(h => h.trim());

    const geneIndex = header.findIndex(h =>
        h.toLowerCase() === "gene"
    );

    const coverageIndex = header.findIndex(h =>
    h.trim().toLowerCase() === "x"
    );

    if(geneIndex === -1){

        alert("Gene column not found.");

        return;

    }

    if(coverageIndex === -1){

        alert("20X column not found.");

        return;

    }

    geneData = [];

    for(let i=1;i<lines.length;i++){

        if(lines[i].trim()==="")
            continue;

        const cols = lines[i].split(",");

        if(cols.length <= Math.max(geneIndex,coverageIndex))
            continue;

        const gene = cols[geneIndex].trim();

        const coverage = parseFloat(cols[coverageIndex]);

        if(gene==="")
            continue;

        geneData.push({

            gene:gene,

            coverage:isNaN(coverage)?null:coverage

        });

    }

    geneData.sort((a,b)=>a.gene.localeCompare(b.gene));

}



// ==========================================
// Render Table
// ==========================================

function renderTable(data){

    const tbody=document.getElementById("tableBody");

    tbody.innerHTML="";

    if(data.length===0){

        document.getElementById("noResults").style.display="block";

        return;

    }

    document.getElementById("noResults").style.display="none";

    data.forEach(item=>{

        const row=document.createElement("tr");

        const coverageText=
            item.coverage===null
            ? "-"
            : item.coverage.toFixed(2)+"%";

        row.innerHTML=`

            <td class="gene-name">${item.gene}</td>

            <td class="coverage-value">${coverageText}</td>

        `;

        tbody.appendChild(row);

    });

}



// ==========================================
// Search
// ==========================================

const searchBox=document.getElementById("searchInput");

searchBox.addEventListener("input",function(){

    const query=this.value.trim().toLowerCase();

    if(query===""){

        renderTable(geneData);

        return;

    }

    const filtered=geneData.filter(item=>

        item.gene.toLowerCase().includes(query)

    );

    renderTable(filtered);

});



// ==========================================
// Download Displayed Table
// ==========================================

document.getElementById("downloadBtn").addEventListener("click",function(){

    const rows=document.querySelectorAll("#coverageTable tbody tr");

    let csv = "Gene,Coverage (%)\n";

    rows.forEach(row=>{

        const cols=row.querySelectorAll("td");

        if(cols.length<2)
            return;

        const gene=cols[0].innerText.trim();

        const coverage=cols[1].innerText.trim();

        csv+=`${gene},${coverage}\n`;

    });

    const blob=new Blob([csv],{

        type:"text/csv;charset=utf-8;"

    });

    const url=URL.createObjectURL(blob);

    const link=document.createElement("a");

    link.href=url;

    link.download="Gene_Coverage_Summary.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

});
