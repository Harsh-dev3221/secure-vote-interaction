
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-primary font-semibold text-xl mb-4">
              <span className="inline-block w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                SSVB
              </span>
              <span>Secure Smart Voting</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Revolutionizing democracy with cutting-edge blockchain technology that ensures secure, 
              transparent and verifiable elections accessible to all citizens.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SSVB. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Authentication
                </Link>
              </li>
              <li>
                <Link to="/vote" className="text-muted-foreground hover:text-primary transition-colors">
                  Vote
                </Link>
              </li>
              <li>
                <Link to="/results" className="text-muted-foreground hover:text-primary transition-colors">
                  Results
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Blockchain Voting
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Security Measures
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Accessibility Features
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
