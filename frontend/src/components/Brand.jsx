import amispayLogo from "../assets/amispay-logo.png";

function Brand() {

  return (

    <div className="brand">

      <img
        src={amispayLogo}
        alt="AmisPay"
        className="brand-logo"
      />

    </div>
  );
}

export default Brand;