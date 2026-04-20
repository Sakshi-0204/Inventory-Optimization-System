const API = "http://localhost:8080";

// LOGIN
function login(){
    fetch(API+"/auth/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:username.value,
            password:password.value
        })
    })
    .then(res=>{
        if(!res.ok) throw new Error();
        return res.json();
    })
    .then(user=>{
        window.currentUserRole = user.role;
        window.currentUser = user.username;

        loginPage.style.display="none";
        app.style.display="block";

        userLabel.innerText = user.username + " (" + user.role + ")";

        showPage("dashboard");
        loadAll();
    })
    .catch(()=>alert("Invalid login"));
}

function signup(){
    fetch(API+"/auth/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username:username.value,
            password:password.value,
            role:"manager"
        })
    }).then(()=>alert("User created"));
}

function logout(){ location.reload(); }

// NAVIGATION
function showPage(page){

    // hide all pages
    document.querySelectorAll(".page")
    .forEach(p => p.style.display = "none");

    // show selected page
    document.getElementById(page + "Page").style.display = "block";

    // load data
    if(page === "dashboard") loadDashboard();
    if(page === "product") loadProducts();
    if(page === "alerts") loadAlerts();
}

function highlightActive(btn){
    document.querySelectorAll(".sidebar button")
    .forEach(b=>b.style.background="none");

    btn.style.background="rgba(255,255,255,0.2)";
}

// LOAD
function loadAll(){
    loadDashboard();
    loadProducts();
    loadAlerts();
}

// DASHBOARD
function loadDashboard(){
    fetch(API+"/dashboard")
    .then(r=>r.json())
    .then(d=>{
        total.innerText=d.total;
        low.innerText=d.low;
        out.innerText=d.out;
        over.innerText=d.over;
    });
}

// ADD
function addProduct(){
    fetch(API+"/add",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            name:document.getElementById("name").value,
            quantity:+document.getElementById("quantity").value,
            threshold:+document.getElementById("threshold").value,
            maxStock:+document.getElementById("maxStock").value,
            price:+document.getElementById("price").value,
            category:document.getElementById("category").value
        })
    }).then(()=>{
        showPopup("Product Added");
        loadAll();
    });
}

// PRODUCTS
function loadProducts(){
    fetch(API+"/products")
    .then(r=>r.json())
    .then(showTable);
}

function showTable(data){
    let html="";
    data.forEach(p=>{
        let cls="",status="OK";

        if(p.quantity==0){cls="outRow";status="Out";}
        else if(p.quantity<p.threshold){cls="lowRow";status="Low";}
        else if(p.quantity>p.maxStock){cls="overRow";status="Over";}

        html+=`
        <tr class="${cls}">
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>${p.threshold}</td>
            <td>${status}</td>
            <td>
                ${currentUserRole==="admin" 
                    ? `<button onclick="deleteProduct(${p.id})">Delete</button>`
                    : `<span style="color:gray">No Access</span>`}
            </td>
        </tr>`;
    });
    table.innerHTML=html;
}

function deleteProduct(id){
    if(currentUserRole!=="admin"){
        showPopup("Only Admin can delete ❌");
        return;
    }

    fetch(API+"/delete/"+id+"?role="+currentUserRole,{
        method:"DELETE"
    })
    .then(res=>res.text())
    .then(msg=>{
        showPopup(msg);
        loadAll();
    });
}

// SEARCH / FILTER
function search(){
    fetch(API+"/search?name="+searchInput.value)
    .then(r=>r.json())
    .then(showTable);
}

function filter(type){
    fetch(API+"/filter/"+type)
    .then(r=>r.json())
    .then(showTable);
}

function sort(){
    fetch(API+"/sort")
    .then(r=>r.json())
    .then(showTable);
}

// ALERTS
function loadAlerts(){
    fetch(API + "/alerts")
    .then(r => r.json())
    .then(data => {

        let html = "";

        data.forEach(p => {
            html += `<li>${p.name} needs restock</li>`;

            // 🔥 POPUP TRIGGER
            showPopup(p.name + " is LOW STOCK ⚠️");
        });

        document.getElementById("alerts").innerHTML = html;
    });
}
// REPORT
function downloadReport(){
    fetch(API+"/products")
    .then(r=>r.json())
    .then(data=>{
        let csv="Name,Qty\n";
        data.forEach(p=>csv+=`${p.name},${p.quantity}\n`);
        let blob=new Blob([csv]);
        let a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="report.csv";
        a.click();
    });
}

// POPUP
let popupQueue = [];
let isShowing = false;

function showPopup(msg){
    popupQueue.push(msg);
    if(!isShowing) showNextPopup();
}

function showNextPopup(){
    if(popupQueue.length === 0){
        isShowing = false;
        return;
    }

    isShowing = true;

    const popup = document.getElementById("popup");
    popup.innerText = popupQueue.shift();
    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
        showNextPopup();
    }, 3000);
}