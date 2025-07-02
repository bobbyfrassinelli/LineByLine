
const Index = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FFE0B8' }}
    >
      <canvas
        width={600}
        height={400}
        className="shadow-lg"
        style={{
          backgroundColor: '#FFFFFF',
          border: '4px solid #FFBF7F'
        }}
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
    </div>
  );
};

export default Index;
