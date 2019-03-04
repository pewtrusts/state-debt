import Element from '@UI/element/';

export default class Comparison extends Element {
    prerender(){
        var div = super.prerender();
        this.matches = [];
        this.matches[0] = this.model.data.find(d => d.code === this.data.comparison[0]);
        this.matches[1] = this.model.data.find(d => d.code === this.data.comparison[1]);
        
        if ( this.prerendered && !this.rerender) {
            return div;
        }
        

        return div;
    }
    update(index,data){
        this.matches[index] = this.model.data.find(d => d.code === data);
    }

}