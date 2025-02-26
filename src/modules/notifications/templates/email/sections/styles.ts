export const styles = `
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    margin: 0;
    padding: 0;
  }

  header {
    text-align: center;
    margin-bottom: 20px;
  }

  header h1 {
    color: #333;
    margin: 0;
  }

  main {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .activate-button {
    display: inline-block;
    padding: 12px 20px;
    background-color: #007BFF;
    color: white !important;
    text-decoration: none;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .activate-button:hover {
    background-color: #0056b3;
  }

  .activate-button:focus {
    outline: 2px solid #007BFF;
  }

  footer {
    text-align: center;
    margin-top: 20px;
    font-size: 12px;
    color: #777;
  }
</style>
`;
