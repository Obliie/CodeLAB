import logging

from service_logging import init_logging, log_and_flush

class Runner:
    def __init__(self, config):
        log_and_flush(logging.INFO, "Initializing runner...")

    def compile(self):
        log_and_flush(logging.INFO, "Compiling code...")

    def run(self):
        log_and_flush(logging.INFO, "Running code...")

if __name__ == "__main__":
    init_logging()