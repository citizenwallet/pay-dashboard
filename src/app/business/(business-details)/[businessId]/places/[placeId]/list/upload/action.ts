'use server';

export async function downloadCsvTemplateAction() {
  const headers = ['Name', 'Description'];
  const exampleData = ['My place name', 'My place description'];

  const csvData = [headers.join(','), exampleData.join(',')].join('\n');

  return csvData;
}
