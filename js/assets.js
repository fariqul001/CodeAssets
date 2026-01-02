// This file manages the asset-related functionalities, including adding new assets, updating asset details, and displaying the asset list.

const assets = [];

// Function to add a new asset
function addAsset(asset) {
    assets.push(asset);
    displayAssets();
}

// Function to update an existing asset
function updateAsset(index, updatedAsset) {
    if (index >= 0 && index < assets.length) {
        assets[index] = updatedAsset;
        displayAssets();
    } else {
        console.error('Asset index out of bounds');
    }
}

// Function to display the list of assets
function displayAssets() {
    const assetList = document.getElementById('asset-list');
    assetList.innerHTML = '';

    assets.forEach((asset, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}: ${asset.name} - ${asset.value}`;
        assetList.appendChild(listItem);
    });
}

// Example usage
// addAsset({ name: 'Asset 1', value: 1000 });
// addAsset({ name: 'Asset 2', value: 2000 });