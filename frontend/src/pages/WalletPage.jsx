import '../styles/WalletPage.css'

function WalletPage({ payments, walletBalance }) {
  return (
    <section className="page wallet-page">
      <div className="page-hero">
        <span className="soft-label">Wallet</span>
        <h1>Track balance and transactions.</h1>
        <p>
          Successful payments reduce your demo balance and appear here as
          spend history.
        </p>
      </div>

      <div className="wallet-balance">
        <span>Available balance</span>
        <strong>${walletBalance.toFixed(2)}</strong>
        <p>Available demo funds</p>
      </div>

      <div className="ledger-list">
        {payments.map((payment) => (
          <article className="ledger-row" key={payment.id}>
            <div>
              <strong>{payment.merchant}</strong>
              <p>{payment.orderId}</p>
            </div>
            <span>{payment.id}</span>
            <strong>-${payment.amount.toFixed(2)}</strong>
            <em>{payment.status}</em>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WalletPage
