import logging
import os
import sys

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger that works both locally and on Vercel.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        # Set logging level and format
        logger.setLevel(logging.DEBUG)

        # Formatter for logs
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        formatter = logging.Formatter(log_format)

        # Console Handler (works on Vercel)
        console_handler = logging.StreamHandler(sys.stdout)  # Use stdout for Vercel
        console_handler.setLevel(logging.DEBUG)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # File Handler (only for local development)
        # Vercel doesn't support persistent file storage for logs
        if os.environ.get("VERCEL_ENV") is None:
            try:
                # Create logs directory if not exists (for local development only)
                LOG_DIR = "logs"
                os.makedirs(LOG_DIR, exist_ok=True)
                file_handler = logging.FileHandler(os.path.join(LOG_DIR, "app.log"))
                file_handler.setLevel(logging.DEBUG)  # Capture detailed logs in file
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)
            except OSError:
                # Skip file logging if directory creation fails (e.g., on Vercel)
                pass

        # Avoid duplicated logs
        logger.propagate = False

    return logger
