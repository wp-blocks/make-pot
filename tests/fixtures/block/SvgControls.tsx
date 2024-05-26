import {
	BlockControls,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	FormFileUpload,
	Popover,
	ToolbarButton,
	ToolbarGroup,
} from "@wordpress/components";
import { useEffect, useMemo, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { displayShortcut, isKeyboardEvent } from "@wordpress/keycodes";
import { ALLOWED_MEDIA_TYPES, NEW_TAB_TARGET } from "../utils/constants";
import { readSvg } from "../utils/svgTools";

/**
 * A component that renders SVG controls.
 *
 * @param {Object}   props               - The component props.
 * @param {Object}   props.attributes    - The attributes of the SVG controls.
 * @param {Function} props.setAttributes - A function to set the attributes of the SVG controls.
 * @param {boolean}  props.isSelected    - A boolean value indicating if the SVG controls are selected.
 * @param {Function} props.updateSvg     - A function to update the SVG.
 * @param {Object}   props.SvgRef        - A reference to the SVG.
 * @return {JSX.Element} The rendered SVG controls component.
 */
function SvgControls({
	attributes,
	setAttributes,
	isSelected,
	updateSvg,
	SvgRef,
}) {
	/**
	 * @property {boolean} isEditingURL - a bool value that stores id the link panel is open
	 * @callback setIsEditingURL
	 */
	const { svg, href, linkTarget, rel, title } = attributes;
	const [isEditingURL, setIsEditingURL] = useState(false);
	const isURLSet = !!href;

	const opensInNewTab = linkTarget === NEW_TAB_TARGET;

	const memoizedValue = useMemo(
		() => ({
			url: href,
			title,
			opensInNewTab: linkTarget === "_blank",
			rel,
		}),
		[href, opensInNewTab, title, rel],
	);

	const openLinkControl = () => {
		setIsEditingURL(true);
		return false;
	};

	/**
	 * Checking if the block is selected.
	 * If it is not selected, it sets the isEditingURL state to false.
	 *
	 * @type {setIsEditingURL}
	 * @property {boolean} isSelected - if the svg has been selected
	 */
	useEffect(() => {
		if (!isSelected) {
			setIsEditingURL(false);
		}
	}, [isSelected]);

	/**
	 * It sets the attributes of the block to undefined, and then sets the state of the block to not editing the URL
	 */
	const unlinkItem = () => {
		setAttributes({
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
			title: undefined,
		});
		setIsEditingURL(false);
	};

	return (
		<>
			{svg && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon="admin-links"
							title={__("Edit Link")}
							onClick={openLinkControl}
							isActive={isURLSet}
						/>
						<ToolbarButton
							icon="editor-unlink"
							title={__("Unlink")}
							onClick={unlinkItem}
							isDisabled={!isURLSet}
						/>
					</ToolbarGroup>
					<ToolbarGroup>
						<FormFileUpload
							type={"button"}
							title={__("Replace SVG")}
							accept={ALLOWED_MEDIA_TYPES[0]}
							multiple={false}
							onChange={(ev) => {
								const newFile: File | boolean =
									ev.target.files !== null ? ev.target.files[0] : false;
								if (newFile) {
									readSvg(newFile).then((newSvg) => {
										if (newSvg !== null) {
											updateSvg(newSvg, newFile);
										}
									});
								}
							}}
						>
							Replace
						</FormFileUpload>
					</ToolbarGroup>
				</BlockControls>
			)}

			{isEditingURL && svg && (
				<Popover
					position="top"
					anchor={SvgRef.current}
					focusOnMount={isEditingURL ? "firstElement" : false}
					onClose={() => setIsEditingURL(false)}
				>
					<LinkControl
						hasTextControl
						hasRichPreviews
						value={memoizedValue}
						settings={[
							{
								id: "opensInNewTab",
								title: "Opens in new tab",
							},
						]}
						onChange={(nextValue) => {
							const {
								url: newHref = "",
								opensInNewTab: newOpensInNewTab,
								title: newTitle = "",
							} = nextValue;

							setAttributes({
								href: newHref,
								linkTarget: !!newOpensInNewTab ? NEW_TAB_TARGET : undefined,
								title: newTitle,
							});

							setIsEditingURL(false);
						}}
					/>
				</Popover>
			)}
		</>
	);
}

export default SvgControls;
