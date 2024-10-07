console.log("Executing global portfolio")

function update_portfolio_page_index(new_index) {
    portfolio_page_index = new_index
    console.log('portfolio_page_index: ', portfolio_page_index)
    return `Hello, ${name}`;
}

let portfolio_page_index;

module.exports = {
    update_portfolio_page_index, 
    portfolio_page_index,
};