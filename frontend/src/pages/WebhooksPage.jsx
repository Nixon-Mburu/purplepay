import '../styles/WebhooksPage.css'

function WebhooksPage({ activity, payments }) {
  return (
    <section className="page webhooks-page">
      <div className="page-hero">
        <span className="soft-label">Activity</span>
        <h1>Watch payments move through the system.</h1>
        <p>
          Follow confirmations, new orders, sign-ins, and wallet changes in a
          friendly activity feed.
        </p>
      </div>

      <div className="webhook-summary">
        <article>
          <span>Confirmed payments</span>
          <strong>{payments.length}</strong>
        </article>
        <article>
          <span>Recent events</span>
          <strong>{activity.length}</strong>
        </article>
      </div>

      <ol className="event-timeline">
        {activity.map((event) => (
          <li key={`${event.title}-${event.time}`}>
            <div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
            <span>{event.time}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default WebhooksPage
