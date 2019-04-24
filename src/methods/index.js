export function formatValue(match, field){
    var metaData = this.model.types.find(d => d.field === field),
        style = metaData.type,
        decimals = metaData.decimals !== undefined ? metaData.decimals : style === 'number' ? 1 : style === 'currency' ? 2 : style === 'percent' ? 1 : undefined,
        value = match[field],
        formattedValueString;
    switch(style){
        case 'number':
            formattedValueString = value.toLocaleString('en-US', {minimumFractionDigits: decimals});
            break;
        case 'currency':
            if ( decimals === 0 ){
                formattedValueString = Math.round(value).toLocaleString('en-US', {style,currency:'USD'}).slice(0,-3);
            } else {
                formattedValueString = value.toLocaleString('en-US', {style,currency:'USD'});
            }
            break;
        case 'percent':
            formattedValueString = value.toLocaleString('en-US', {style, minimumFractionDigits: decimals});
            break;
        default:
            formattedValueString = '[unformatted]' + value;
    }

    return formattedValueString;
}