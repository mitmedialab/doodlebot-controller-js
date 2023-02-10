function updateCounter(){
    countDiv.style.display = 'none';
countDiv.style.display = 'block';
    countDiv.innerText = Number(countDiv.innerText) + 1;
}
let instance = new TestClass(updateCounter)

updateCounterButton.addEventListener("click", ()=>{
    updateCounter();
})

testUpdate.addEventListener("click", ()=>{
    let n = 10000;
    instance.multiple_redraw(n);

    // setInterval(updateCounter, 1000)
    // for (let i = 0; i < n; i++){
        // updateCounter();
    // }
})