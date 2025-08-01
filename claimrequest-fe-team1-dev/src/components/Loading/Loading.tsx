import "./Loading.css";

const colors = ["#1169B0", "#F27227", "#16B14B"];

const Loading = () => {
  return (
    <div className="scoverview__wrap">
      <div className="ovcenter__model-inner">
        <div className="logolist">
          {colors.map((color, index) => (
            <div
              key={index}
              className="item"
              style={{
                backgroundColor: color
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
