// Test the FIXED parsing logic
function testParsing() {
  console.log('=== Testing FIXED URL Message ===');
  const urlMessage = { text: "https://example.com #coding @research *This is a complete description" };
  const urlParts = urlMessage.text?.split(' ') || [];
  console.log('URL Parts:', urlParts);
  
  const url = urlParts[0];
  const urlTags = urlParts.filter((p) => p.startsWith('#')).map((p) => p.slice(1));
  const urlFolder = urlParts.find((p) => p.startsWith('@'))?.slice(1);
  const urlDescriptionIndex = urlParts.findIndex((p) => p.startsWith('*'));
  const urlDescription = urlDescriptionIndex !== -1 ? 
    urlParts.slice(urlDescriptionIndex).join(' ').replace(/^\*/, '') : '';
  
  console.log('URL:', url);
  console.log('URL Tags:', urlTags);
  console.log('URL Folder:', urlFolder);
  console.log('URL Description Index:', urlDescriptionIndex);
  console.log('URL Description:', urlDescription);
  
  console.log('\n=== Testing FIXED Tags Message ===');
  const tagsMessage = { text: "#ai #ml *Latest ML research" };
  const tagsParts = tagsMessage.text?.split(' ') || [];
  console.log('Tags Parts:', tagsParts);
  
  const tags = tagsParts.filter((p) => p.startsWith('#')).map((p) => p.slice(1));
  const folder = tagsParts.find((p) => p.startsWith('@'))?.slice(1);
  const descriptionIndex = tagsParts.findIndex((p) => p.startsWith('*'));
  const description = descriptionIndex !== -1 ? 
    tagsParts.slice(descriptionIndex).join(' ').replace(/^\*/, '') : '';
  
  console.log('Tags:', tags);
  console.log('Folder:', folder);
  console.log('Description Index:', descriptionIndex);
  console.log('Description:', description);
  
  console.log('\n=== Final Results ===');
  const finalDescription = description || urlDescription;
  console.log('Final Description:', finalDescription);
}

testParsing();
