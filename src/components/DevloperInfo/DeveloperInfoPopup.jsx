// Example structure for a React component (conceptual)
import './DeveloperInfoPopup.css'
function DeveloperInfoPopup({ show, onClose, studentName, studentPhotoUrl, uniqueMessage }) {
  if (!show) {
    return null; // Don't render if not visible
  }
  return (
    <div className="popup-overlay"> {/* Covers the whole screen, usually semi-transparent */}
      <div className="popup-content"> {/* The actual pop-up box */}
        <button className="close-button" onClick={onClose}>&times;</button> {/* Close button */}
        <img src={studentPhotoUrl} alt={`${studentName}'s Photo`} className="student-photo" />
        <h3 className="popup-title">Developed & Deployed by:</h3>
        <p className="student-name">{studentName}</p>
        <p className="unique-message">{uniqueMessage}</p>
        <button className="ok-button" onClick={onClose}>Got It!</button> {/* Another close option */}
      </div>
    </div>
  );
}
export default DeveloperInfoPopup;