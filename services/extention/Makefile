DIR='popup'

build:
	@echo "Building $(DIR) ..."
	@cd $(DIR) && npm run build
	@echo "Build complete."
	@echo "Copying files to $(DIR)/dist ..."
	@rm -rf $(DIR)/dist
	@mv $(DIR)/dist ..
		