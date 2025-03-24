
const Footer = () => {
  return (
    <footer className="border-t border-secondary py-4 px-6 mt-10 m-1 rounded-xl">
      {/* Copyright */}
      <div className="mt-3 text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text text-sm">
        © {new Date().getFullYear()} PK ToolsCloud. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
