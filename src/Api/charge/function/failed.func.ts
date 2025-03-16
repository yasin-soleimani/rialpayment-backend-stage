export function ChargeFaildFunction() {
  return `<head>  <meta charset="UTF-8"></head><style> body, html {
    margin: 0;
    padding: 0;
    background: slateblue;
    height: 100vh;
  }
  .container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .container>.message {
    width: 60vh;
    background: white;
    height: 50px;
    text-align: center;
    color: #444;
    padding: 2em;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    border-radius: 8px;
  }
  .container>.message>h2 {
    margin: 0;
  }</style>  <div class="container">
      <div class="message">
        <h2>توکن شما منقضی شده است</h2>
      </div>
    </div>`;
}
