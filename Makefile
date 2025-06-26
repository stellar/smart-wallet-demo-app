# Find all Makefiles in contracts directory
CONTRACT_MAKEFILES := $(shell find contracts -name Makefile)

# Default target
default: build

# Execute 'all' target in all contract Makefiles
all:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'all' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) all; \
	done

# Execute 'build' target in all contract Makefiles
build:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'build' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) build; \
	done

# Execute 'test' target in all contract Makefiles
test:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'test' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) test; \
	done

# Execute 'fmt' target in all contract Makefiles
fmt:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'fmt' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) fmt; \
	done

# Execute 'clean' target in all contract Makefiles
clean:
	@for makefile in $(CONTRACT_MAKEFILES); do \
		echo "Executing 'clean' in $$(dirname $$makefile)"; \
		$(MAKE) -C $$(dirname $$makefile) clean; \
	done

.PHONY: default all build test fmt clean add_network
