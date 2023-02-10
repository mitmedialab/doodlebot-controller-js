class TestClass{
    constructor(redraw){
        this.redraw = redraw;
    }
    multiple_redraw(n){
        for (let i = 0; i < n; i++){
            this.redraw();
        }
    }
}