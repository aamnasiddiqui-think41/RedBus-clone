from loguru import logger
import sys

# Configure Loguru
logger.remove()
logger.add(sys.stdout, level="INFO", enqueue=True, backtrace=False, diagnose=False)
logger.add("app.log", rotation="5 MB", retention="7 days", compression="zip", level="INFO")

__all__ = ["logger"]
