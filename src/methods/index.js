export function formatValue(match, field){
    var style = this.model.types.find(d => d.field === field).type,
        value = match[field],
        formattedValueString;
    console.log(value);
    switch(style){
        case 'number':
            formattedValueString = value.toLocaleString('en-US', {minimumFractionDigits: 1});
            break;
        case 'currency':
            formattedValueString = value.toLocaleString('en-US', {style,currency:'USD'});
            break;
        case 'percent':
            formattedValueString = value.toLocaleString('en-US', {style, minimumFractionDigits: 1});
            break;
        default:
            formattedValueString = '[unformatted]' + value;
    }

    return formattedValueString;
}