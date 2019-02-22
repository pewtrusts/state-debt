import Element from '@UI/element/';

export default class Comparison extends Element {
    prerender(){
        var div = super.prerender();
        this.matches = [];
        if ( this.prerendered && this.rerender) {
            return div;
        }
        
        this.matches[0] = this.model.data.find(d => d.code === this.data.comparison[0]);
        this.matches[1] = this.model.data.find(d => d.code === this.data.comparison[1]);

        return div;
    }
    init(){
    }
}